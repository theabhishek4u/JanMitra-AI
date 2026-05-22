// ============================================
// JanMitra AI — Dynamic Persistence & Feature Verification Test
// ============================================
// Verifies notification queues, dynamic hotspot clustering, 
// auto-priority elevation, and status routing logic.

const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};

// Set up mock client environment
(global as any).window = {
  dispatchEvent: () => {}
};
(global as any).CustomEvent = class {
  constructor(type: string, options?: any) {}
};
(global as any).localStorage = mockLocalStorage;

async function runVerification() {
  console.log("🚀 STARTING JANMITRA AI FEATURE VERIFICATION SUITE...\n");

  // Dynamically import complaints functions to ensure global mocks are loaded first!
  const {
    addComplaint,
    getComplaints,
    updateComplaintStatus,
    getCitizenNotifications,
    getOfficerNotifications,
    clearNotifications,
  } = await import("../lib/complaints");

  // Reset notifications
  clearNotifications("citizen");
  clearNotifications("officer");

  // ----------------------------------------------------
  // TEST 1: File 1 grievance in Aliganj
  // ----------------------------------------------------
  console.log("--- TEST 1: Submitting First Grievance ---");
  const c1 = addComplaint({
    title: "Overflowing Garbage Bin in Sector Q",
    titleHi: "सेक्टर Q में कचरा पात्र का अतिप्रवाह",
    description: "The garbage bin at Sector Q main market is overflowing. Severe bad smell.",
    descriptionHi: "सेक्टर Q मुख्य बाजार में कचरा पात्र बह रहा है। गंभीर दुर्गंध।",
    category: "Garbage / Sanitation",
    categoryHi: "कचरा / स्वच्छता",
    area: "Aliganj, Lucknow",
    citizenId: "cit-123",
    citizenName: "Amit Sharma",
    priority: "medium"
  });
  console.log(`✅ Complaint 1 submitted successfully: ID = ${c1.id}`);
  
  // Verify officer notification
  let officerNotifs = getOfficerNotifications();
  console.log(`🔍 Officer Notifications Count: ${officerNotifs.length}`);
  if (officerNotifs.length > 0) {
    console.log(`✅ Officer Notification Received: "${officerNotifs[0].message}"`);
  } else {
    throw new Error("FAIL: Officer notification not generated on citizen submission.");
  }

  // Verify complaint list properties
  let complaints = getComplaints();
  let complaint1 = complaints.find(c => c.id === c1.id);
  if (!complaint1) throw new Error("FAIL: Complaint 1 not found in database.");
  console.log(`🔍 Initial priority: ${complaint1.priority}`);
  console.log(`🔍 Initial isHotspot status: ${complaint1.isHotspot} (Count: ${complaint1.hotspotCount})`);
  if (complaint1.isHotspot) {
    throw new Error("FAIL: Complaint should not be a hotspot when count is 1.");
  }
  console.log("✅ First grievance verification complete.\n");

  // ----------------------------------------------------
  // TEST 2: File 2nd grievance in Aliganj under same category
  // ----------------------------------------------------
  console.log("--- TEST 2: Submitting Second Grievance in Same Area & Category (Hotspot Trigger) ---");
  const c2 = addComplaint({
    title: "Garbage near Aliganj Park entrance",
    titleHi: "अलीगंज पार्क प्रवेश द्वार के पास कचरा",
    description: "Huge pile of trash sitting here for 4 days.",
    descriptionHi: "यहाँ 4 दिनों से कचरे का बड़ा ढेर लगा हुआ है।",
    category: "Garbage / Sanitation",
    categoryHi: "कचरा / स्वच्छता",
    area: "Aliganj, Lucknow",
    citizenId: "cit-456",
    citizenName: "Ritu Verma",
    priority: "medium"
  });
  console.log(`✅ Complaint 2 submitted successfully: ID = ${c2.id}`);

  // Retrieve complaints list and verify hotspots
  complaints = getComplaints();
  const c1Updated = complaints.find(c => c.id === c1.id)!;
  const c2Updated = complaints.find(c => c.id === c2.id)!;

  console.log(`🔍 Complaint 1 Updated isHotspot: ${c1Updated.isHotspot} (Count: ${c1Updated.hotspotCount})`);
  console.log(`🔍 Complaint 1 Updated priority: ${c1Updated.priority}`);
  console.log(`🔍 Complaint 2 Updated isHotspot: ${c2Updated.isHotspot} (Count: ${c2Updated.hotspotCount})`);
  console.log(`🔍 Complaint 2 Updated priority: ${c2Updated.priority}`);

  if (c1Updated.isHotspot && c2Updated.isHotspot) {
    console.log("✅ SUCCESS: AI Spatial Clustering engine successfully triggered HOTSPOT status on both grievances!");
  } else {
    throw new Error("FAIL: Hotspot engine did not group complaints in the same area & category.");
  }

  if (c1Updated.priority === "high" && c2Updated.priority === "high") {
    console.log("✅ SUCCESS: Priority dynamically elevated to 'high' for both complaints!");
  } else {
    throw new Error("FAIL: Priority elevation to high did not trigger for hotspot.");
  }

  // Verify hot-priority sorting
  console.log("🔍 Checking Active Queue sorting order...");
  console.log(`   Top item ID in queue: ${complaints[0].id} (isHotspot: ${complaints[0].isHotspot}, priority: ${complaints[0].priority})`);
  if (complaints[0].isHotspot === true) {
    console.log("✅ SUCCESS: Active hotspots correctly bubble up to the top of the command console queue!");
  } else {
    throw new Error("FAIL: Active hotspots did not sort to the top of the queue.");
  }
  console.log("✅ Hotspot clustering verification complete.\n");

  // ----------------------------------------------------
  // TEST 3: Officer Updates and Resolves Complaint
  // ----------------------------------------------------
  console.log("--- TEST 3: Officer Updates Status to Resolved ---");
  const resolvedNotesEn = "Waste removal vehicles dispatched. Cleaned and disinfected the area.";
  const resolvedNotesHi = "कचरा हटाने वाले वाहन भेजे गए। क्षेत्र को साफ और कीटाणुरहित किया गया।";
  
  const updatedC1 = updateComplaintStatus(
    c1.id,
    "resolved",
    "Shri Rajesh Kumar",
    resolvedNotesEn,
    resolvedNotesHi
  );

  if (!updatedC1) throw new Error("FAIL: Failed to update status of Complaint 1.");
  console.log(`✅ Complaint 1 status advanced to: ${updatedC1.status}`);
  
  // Verify citizen notifications
  const citizenNotifs = getCitizenNotifications();
  console.log(`🔍 Citizen Notifications Count: ${citizenNotifs.length}`);
  if (citizenNotifs.length > 0) {
    console.log(`✅ Citizen Notification Message (EN): "${citizenNotifs[0].message}"`);
    console.log(`✅ Citizen Notification Message (HI): "${citizenNotifs[0].messageHi}"`);
    if (
      citizenNotifs[0].message.includes("resolved") &&
      citizenNotifs[0].message.includes(resolvedNotesEn)
    ) {
      console.log("✅ SUCCESS: Citizen received resolution alert with custom officer notes successfully!");
    } else {
      throw new Error("FAIL: Citizen notification does not contain custom resolution notes.");
    }
  } else {
    throw new Error("FAIL: Citizen did not receive resolution notification.");
  }

  // Verify hotspot resolution shrinkage
  console.log("🔍 Verifying Hotspot Shrinkage after resolution...");
  complaints = getComplaints();
  const c1Final = complaints.find(c => c.id === c1.id)!;
  const c2Final = complaints.find(c => c.id === c2.id)!;

  console.log(`🔍 Complaint 1 (Resolved) isHotspot: ${c1Final.isHotspot}`);
  console.log(`🔍 Complaint 2 (Active) isHotspot: ${c2Final.isHotspot}`);
  
  if (c2Final.isHotspot === false) {
    console.log("✅ SUCCESS: Resolving one grievance successfully shrunk the cluster size below 2, dynamically resolving the Hotspot status on the remaining grievance!");
  } else {
    throw new Error("FAIL: Remaining active grievance should no longer be marked as a hotspot.");
  }
  console.log("✅ Officer resolution and dynamic shrinkage verification complete.\n");

  console.log("🎉 ALL TESTS PASSED! THE PERSISTENCE ENGINE AND AI CLUSTERING CRITERIA ARE 100% CORRECT! 🚀");
}

runVerification().catch(e => {
  console.error("❌ VERIFICATION TEST FAILED:");
  console.error(e);
  process.exit(1);
});
