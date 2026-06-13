import { registerCitizen, loginCitizen } from "../lib/auth";
import { getComplaints } from "../lib/complaints";

async function runTests() {
  console.log("🚀 STARTING CITIZEN AUTHENTICATION VERIFICATION SUITE...\n");

  const testEmail = `test_citizen_${Date.now()}@gmail.com`;
  const testMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`; // Random 10-digit number starting with 9
  const testPassword = "securepass123";
  const testName = "Jane Doe";

  // Test 1: Citizen Registration
  console.log("--- TEST 1: Registering New Citizen ---");
  const regRes = await registerCitizen(testName, testEmail, testMobile, testPassword);
  
  if (regRes.success && regRes.session) {
    console.log(`✅ Citizen registered successfully! ID = ${regRes.session.id}`);
    console.log(`   Name: ${regRes.session.name}, Email: ${regRes.session.email}, Mobile: ${regRes.session.mobile}`);
  } else {
    console.error("❌ Registration failed:", regRes.error);
    process.exit(1);
  }

  // Test 2: Duplicate Email Registration (Should Fail)
  console.log("\n--- TEST 2: Attempting Duplicate Registration (Email) ---");
  const dupEmailRes = await registerCitizen("John Smith", testEmail, "9998887776", "password123");
  if (!dupEmailRes.success) {
    console.log(`✅ Expected failure received: "${dupEmailRes.error}"`);
  } else {
    console.error("❌ Failure expected but registration succeeded!");
    process.exit(1);
  }

  // Test 3: Citizen Login (Email)
  console.log("\n--- TEST 3: Logging In with Email ---");
  const loginEmailRes = await loginCitizen(testEmail, testPassword);
  if (loginEmailRes.success && loginEmailRes.session) {
    console.log(`✅ Login succeeded! Verified Role = ${loginEmailRes.session.role}`);
  } else {
    console.error("❌ Login failed:", loginEmailRes.error);
    process.exit(1);
  }

  // Test 4: Citizen Login (Mobile)
  console.log("\n--- TEST 4: Logging In with Mobile ---");
  const loginMobileRes = await loginCitizen(testMobile, testPassword);
  if (loginMobileRes.success && loginMobileRes.session) {
    console.log(`✅ Login succeeded! Verified Name = ${loginMobileRes.session.name}`);
  } else {
    console.error("❌ Login failed:", loginMobileRes.error);
    process.exit(1);
  }

  // Test 5: Citizen Complaints Filtering
  console.log("\n--- TEST 5: Verifying Empty Complaints Filtering for New Citizen ---");
  if (regRes.session && regRes.session.id) {
    const complaints = await getComplaints(regRes.session.id);
    console.log(`✅ Filtered Complaints Count: ${complaints.length}`);
    if (complaints.length === 0) {
      console.log("✅ SUCCESS: Complaints correctly isolated for new citizen!");
    } else {
      console.error("❌ complaints array is not empty for new citizen!");
      process.exit(1);
    }
  }

  console.log("\n🎉 ALL CITIZEN AUTHENTICATION TESTS PASSED SUCCESSFULY! 🚀");
}

runTests().catch((err) => {
  console.error("❌ Test run crashed:", err);
  process.exit(1);
});
