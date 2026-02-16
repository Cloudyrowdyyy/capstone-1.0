/**
 * Guard Replacement System
 * Handles automated detection of no-shows and deployment of replacement guards
 */

import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = 'mongodb://localhost:27017'
const DB_NAME = 'login_app'
const NO_SHOW_THRESHOLD_MINUTES = 15 // Grace period before marking no-show

let db

export async function initializeReplacementSystem() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  db = client.db(DB_NAME)
  
  // Create collections if they don't exist
  const collections = await db.listCollections().toArray()
  const collectionNames = collections.map(c => c.name)
  
  if (!collectionNames.includes('shifts')) {
    await db.createCollection('shifts')
    await db.collection('shifts').createIndex({ guardId: 1, startTime: 1 })
    console.log('✓ Created shifts collection')
  }
  
  if (!collectionNames.includes('attendance')) {
    await db.createCollection('attendance')
    await db.collection('attendance').createIndex({ guardId: 1, shiftId: 1 })
    console.log('✓ Created attendance collection')
  }
  
  if (!collectionNames.includes('guard_availability')) {
    await db.createCollection('guard_availability')
    await db.collection('guard_availability').createIndex({ guardId: 1, date: 1 })
    console.log('✓ Created guard_availability collection')
  }
  
  if (!collectionNames.includes('replacements')) {
    await db.createCollection('replacements')
    await db.collection('replacements').createIndex({ originalShiftId: 1, status: 1 })
    console.log('✓ Created replacements collection')
  }
}

/**
 * Create a shift for a guard
 */
export async function createShift(guardId, startTime, endTime, clientSite) {
  try {
    const result = await db.collection('shifts').insertOne({
      guardId: new ObjectId(guardId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      clientSite,
      status: 'scheduled', // scheduled, in-progress, completed, no-show
      createdAt: new Date(),
      createdBy: 'admin',
      replacementRequired: false,
      replacementGuardId: null
    })
    
    console.log(`✓ Shift created: ${result.insertedId}`)
    return result.insertedId
  } catch (error) {
    console.error('Error creating shift:', error.message)
    throw error
  }
}

/**
 * Record attendance check-in
 */
export async function recordCheckIn(guardId, shiftId) {
  try {
    // Update shift status
    await db.collection('shifts').updateOne(
      { _id: new ObjectId(shiftId) },
      { $set: { status: 'in-progress' } }
    )
    
    // Record attendance
    const result = await db.collection('attendance').insertOne({
      guardId: new ObjectId(guardId),
      shiftId: new ObjectId(shiftId),
      checkInTime: new Date(),
      checkOutTime: null
    })
    
    console.log(`✓ Check-in recorded: ${result.insertedId}`)
    return result.insertedId
  } catch (error) {
    console.error('Error recording check-in:', error.message)
    throw error
  }
}

/**
 * Record check-out
 */
export async function recordCheckOut(guardId, shiftId) {
  try {
    await db.collection('attendance').updateOne(
      { guardId: new ObjectId(guardId), shiftId: new ObjectId(shiftId) },
      { $set: { checkOutTime: new Date() } }
    )
    
    await db.collection('shifts').updateOne(
      { _id: new ObjectId(shiftId) },
      { $set: { status: 'completed' } }
    )
    
    console.log(`✓ Check-out recorded`)
  } catch (error) {
    console.error('Error recording check-out:', error.message)
    throw error
  }
}

/**
 * Detect no-shows: Find shifts without check-in within threshold
 */
export async function detectNoShows() {
  try {
    const now = new Date()
    const thresholdTime = new Date(now.getTime() - NO_SHOW_THRESHOLD_MINUTES * 60000)
    
    // Find shifts that started but have no check-in
    const noShowShifts = await db.collection('shifts').find({
      status: 'scheduled',
      startTime: { $lt: thresholdTime },
      replacementRequired: false
    }).toArray()
    
    console.log(`Found ${noShowShifts.length} potential no-show shifts`)
    
    const noShows = []
    
    for (const shift of noShowShifts) {
      // Check if there's an attendance record for this shift
      const attendance = await db.collection('attendance').findOne({
        shiftId: shift._id
      })
      
      if (!attendance) {
        // No check-in recorded - this is a no-show
        await db.collection('shifts').updateOne(
          { _id: shift._id },
          { $set: { status: 'no-show', replacementRequired: true } }
        )
        
        noShows.push({
          shiftId: shift._id,
          guardId: shift.guardId,
          clientSite: shift.clientSite,
          shiftStartTime: shift.startTime
        })
        
        console.log(`✓ No-show detected: Guard ${shift.guardId} missed shift at ${shift.clientSite}`)
      }
    }
    
    return noShows
  } catch (error) {
    console.error('Error detecting no-shows:', error.message)
    throw error
  }
}

/**
 * Find available replacement guards with scoring
 */
export async function findReplacementGuards(noShowShift, maxResults = 5) {
  try {
    const shiftStartTime = new Date(noShowShift.shiftStartTime)
    
    // Get all active guards (excluding the original guard)
    const eligibleGuards = await db.collection('users').find({
      role: 'user',
      verified: true,
      _id: { $ne: noShowShift.guardId }
    }).toArray()
    
    // Score each guard based on availability, proximity, and reliability
    const scoredGuards = []
    
    for (const guard of eligibleGuards) {
      // Check availability
      const availability = await db.collection('guard_availability').findOne({
        guardId: guard._id,
        date: shiftStartTime,
        available: true
      })
      
      if (!availability) continue // Guard not available
      
      // Calculate reliability score (based on completed shifts, attendance rate)
      const totalShifts = await db.collection('shifts').countDocuments({
        guardId: guard._id,
        status: { $in: ['completed', 'in-progress'] }
      })
      
      const attendedShifts = await db.collection('attendance').countDocuments({
        guardId: guard._id,
        checkInTime: { $exists: true }
      })
      
      const reliabilityScore = totalShifts > 0 ? (attendedShifts / totalShifts) * 100 : 0
      
      // Calculate proximity score (if location data available)
      let proximityScore = 50 // Default mid-range
      if (guard.currentLocation && guard.currentLocation.latitude) {
        // TODO: Calculate distance to client site
        proximityScore = 80 // Placeholder
      }
      
      // Calculate final score
      const finalScore = (reliabilityScore * 0.5) + (proximityScore * 0.5)
      
      scoredGuards.push({
        guardId: guard._id,
        guardName: guard.fullName || guard.username,
        guardEmail: guard.email,
        phoneNumber: guard.phoneNumber,
        reliabilityScore: reliabilityScore.toFixed(2),
        proximityScore,
        finalScore,
        lastCompletedShift: new Date() // Placeholder
      })
    }
    
    // Sort by final score and return top results
    return scoredGuards
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, maxResults)
  } catch (error) {
    console.error('Error finding replacement guards:', error.message)
    throw error
  }
}

/**
 * Create replacement request and send notifications
 */
export async function sendReplacementRequest(noShowShift, replacementGuards) {
  try {
    const replacement = await db.collection('replacements').insertOne({
      originalShiftId: noShowShift.shiftId,
      originalGuardId: noShowShift.guardId,
      clientSite: noShowShift.clientSite,
      shiftTime: noShowShift.shiftStartTime,
      status: 'pending', // pending, accepted, declined, expired
      candidateGuards: replacementGuards.map(g => ({
        guardId: g.guardId,
        guardName: g.guardName,
        score: g.finalScore,
        notified: false,
        responded: false
      })),
      acceptedGuardId: null,
      acceptedAt: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60000) // 30 minutes
    })
    
    console.log(`✓ Replacement request created: ${replacement.insertedId}`)
    
    // Queue notifications to be sent
    for (const guard of replacementGuards) {
      // TODO: Send SMS and in-app notification
      console.log(`→ Would send notification to ${guard.guardName} (${guard.phoneNumber})`)
    }
    
    return replacement.insertedId
  } catch (error) {
    console.error('Error sending replacement request:', error.message)
    throw error
  }
}

/**
 * Handle guard accepting replacement assignment
 */
export async function acceptReplacement(replacementId, guardId) {
  try {
    // Update replacement record
    await db.collection('replacements').updateOne(
      { _id: new ObjectId(replacementId) },
      { 
        $set: { 
          status: 'accepted',
          acceptedGuardId: new ObjectId(guardId),
          acceptedAt: new Date()
        }
      }
    )
    
    // Mark original shift as having replacement
    const replacement = await db.collection('replacements').findOne({
      _id: new ObjectId(replacementId)
    })
    
    await db.collection('shifts').updateOne(
      { _id: replacement.originalShiftId },
      {
        $set: {
          replacementGuardId: new ObjectId(guardId),
          status: 'replacement-assigned'
        }
      }
    )
    
    console.log(`✓ Replacement accepted by guard ${guardId}`)
    return true
  } catch (error) {
    console.error('Error accepting replacement:', error.message)
    throw error
  }
}

/**
 * Set guard availability
 */
export async function setGuardAvailability(guardId, date, available) {
  try {
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    
    await db.collection('guard_availability').updateOne(
      { guardId: new ObjectId(guardId), date: dateObj },
      { 
        $set: { 
          guardId: new ObjectId(guardId),
          date: dateObj,
          available,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    console.log(`✓ Updated availability for guard ${guardId} on ${date}: ${available}`)
    return true
  } catch (error) {
    console.error('Error setting availability:', error.message)
    throw error
  }
}

export default {
  initializeReplacementSystem,
  createShift,
  recordCheckIn,
  recordCheckOut,
  detectNoShows,
  findReplacementGuards,
  sendReplacementRequest,
  acceptReplacement,
  setGuardAvailability
}
