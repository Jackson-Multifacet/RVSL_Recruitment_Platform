/**
 * Firebase Indexes Configuration
 * These indexes should be created in your Firestore console for optimal query performance
 * 
 * To create composite indexes:
 * 1. Go to Firebase Console > Firestore Database > Indexes
 * 2. Click "Create Index" and add the fields below
 * 3. Click "Create" and wait for indexing to complete (usually 5-15 minutes)
 */

// ============= CANDIDATES INDEXES =============
const candidateIndexes = {
  // For filtering candidates by status and creation date
  index1: {
    collection: 'candidates',
    fields: [
      { name: 'deletionRequestedAt', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },
  
  // For filtering active candidates by status
  index2: {
    collection: 'candidates',
    fields: [
      { name: 'currentEmploymentStatus', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },

  // For filtering candidates by assigned agent
  index3: {
    collection: 'candidates',
    fields: [
      { name: 'assignedAgentId', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  }
};

// ============= APPLICATIONS INDEXES =============
const applicationIndexes = {
  // For filtering applications by status and date
  index1: {
    collection: 'applications',
    fields: [
      { name: 'status', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },

  // For filtering applications by job and status
  index2: {
    collection: 'applications',
    fields: [
      { name: 'jobId', direction: 'ASCENDING' },
      { name: 'status', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },

  // For filtering applications by candidate
  index3: {
    collection: 'applications',
    fields: [
      { name: 'candidateId', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },

  // For filtering by staff reviewer
  index4: {
    collection: 'applications',
    fields: [
      { name: 'reviewedBy', direction: 'ASCENDING' },
      { name: 'status', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  }
};

// ============= JOBS INDEXES =============
const jobIndexes = {
  // For filtering jobs by status and date
  index1: {
    collection: 'jobs',
    fields: [
      { name: 'status', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  },

  // For filtering jobs by location
  index2: {
    collection: 'jobs',
    fields: [
      { name: 'location', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  }
};

// ============= UPDATES INDEXES =============
const updateIndexes = {
  // For getting updates by type and date
  index1: {
    collection: 'updates',
    fields: [
      { name: 'type', direction: 'ASCENDING' },
      { name: 'createdAt', direction: 'DESCENDING' }
    ]
  }
};

/**
 * Setup Instructions:
 * 
 * 1. AUTOMATED (via Firebase Console):
 *    - Visit: https://console.firebase.google.com
 *    - Go to Project > Firestore Database > Indexes (Composite)
 *    - Click "Create Index" for each index above
 *    - Wait for status to change from "Creating" to "Enabled"
 *
 * 2. AUTOMATIC INDEX SUGGESTION:
 *    - Firebase automatically suggests indexes when you run complex queries
 *    - Check the Firestore logs in the bottom-right corner of the app for index creation links
 *
 * 3. CLI CREATION (advanced):
 *    - Create firestore.indexes.json in project root
 *    - Run: firebase deploy --only firestore:indexes
 *
 * 4. MONITORING:
 *    - Go to Firestore > Indexes to see current index status
 *    - Each index size is listed (larger datasets = larger indexes)
 *    - Avoid creating too many indexes (max ~500 per collection recommended)
 */

export const firebaseIndexes = {
  candidateIndexes,
  applicationIndexes,
  jobIndexes,
  updateIndexes,
};
