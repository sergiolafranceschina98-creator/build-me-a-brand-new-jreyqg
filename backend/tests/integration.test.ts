import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  // Shared state for chaining tests
  let clientId: string;
  let programId: string;
  let sessionId: string;
  let exerciseLogId: string;

  // ============================================================================
  // CLIENT TESTS
  // ============================================================================

  describe("Clients", () => {
    test("Create a new client with all required fields", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          age: 30,
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "intermediate",
          goals: "Build muscle and strength",
          trainingFrequency: 4,
          equipment: "Full gym access",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe("John Doe");
      expect(data.age).toBe(30);
      expect(data.experience).toBe("intermediate");
      expect(data.trainingFrequency).toBe(4);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
      clientId = data.id;
    });

    test("Create a new client with optional fields", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Smith",
          age: 28,
          gender: "Female",
          height: 170,
          weight: 65,
          experience: "beginner",
          goals: "Get fit and healthy",
          trainingFrequency: 3,
          equipment: "Dumbbells only",
          sessionDuration: 45,
          injuries: "Lower back pain",
          preferredExercises: "Bodyweight exercises",
          bodyFatPercentage: 25,
          squat1rm: 80,
          bench1rm: 40,
          deadlift1rm: 100,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe("Jane Smith");
      expect(data.injuries).toBe("Lower back pain");
      expect(data.bodyFatPercentage).toBe(25);
    });

    test("Get all clients", async () => {
      const res = await api("/api/clients");
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].name).toBeDefined();
      expect(data[0].age).toBeDefined();
      expect(data[0].experience).toBeDefined();
      expect(data[0].createdAt).toBeDefined();
    });

    test("Get client by ID", async () => {
      const res = await api(`/api/clients/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(clientId);
      expect(data.name).toBe("John Doe");
      expect(data.height).toBe(180);
      expect(data.weight).toBeDefined();
      expect(data.trainingFrequency).toBe(4);
      expect(data.sessionDuration).toBe(60);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    test("Update client profile", async () => {
      const res = await api(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Smith",
          age: 31,
          weight: 87,
          experience: "advanced",
          goals: "Lose fat and maintain strength",
        }),
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(clientId);
      expect(data.name).toBe("John Smith");
      expect(data.age).toBe(31);
      expect(data.experience).toBe("advanced");
    });

    test("Update client with numeric 1RM values", async () => {
      const res = await api(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squat1rm: 150,
          bench1rm: 110,
          deadlift1rm: 190,
          bodyFatPercentage: 14,
        }),
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(clientId);
      expect(data.squat1rm).toBeDefined();
      expect(data.bench1rm).toBeDefined();
      expect(data.deadlift1rm).toBeDefined();
    });

    test("Update client with null optional fields", async () => {
      const res = await api(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          injuries: null,
          preferredExercises: null,
          bodyFatPercentage: null,
        }),
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.injuries).toBeNull();
      expect(data.preferredExercises).toBeNull();
      expect(data.bodyFatPercentage).toBeNull();
    });

    test("Get non-existent client (404)", async () => {
      const res = await api("/api/clients/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Get client with invalid UUID format (400)", async () => {
      const res = await api("/api/clients/invalid-uuid");
      await expectStatus(res, 400);
    });

    test("Create client with missing required field 'name' (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: 25,
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "beginner",
          goals: "Get fit",
          trainingFrequency: 3,
          equipment: "Gym",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Create client with missing required field 'age' (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Client",
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "beginner",
          goals: "Get fit",
          trainingFrequency: 3,
          equipment: "Gym",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Create client with missing required field 'experience' (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Client",
          age: 25,
          gender: "Male",
          height: 180,
          weight: 85,
          goals: "Get fit",
          trainingFrequency: 3,
          equipment: "Gym",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Create client with missing required field 'trainingFrequency' (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Client",
          age: 25,
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "beginner",
          goals: "Get fit",
          equipment: "Gym",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Create client with missing required field 'sessionDuration' (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Client",
          age: 25,
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "beginner",
          goals: "Get fit",
          trainingFrequency: 3,
          equipment: "Gym",
        }),
      });
      await expectStatus(res, 400);
    });

    test("Create client with invalid experience value (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Client",
          age: 25,
          gender: "Male",
          height: 180,
          weight: 85,
          experience: "invalid",
          goals: "Get fit",
          trainingFrequency: 3,
          equipment: "Gym",
          sessionDuration: 60,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Update non-existent client (404)", async () => {
      const res = await api("/api/clients/00000000-0000-0000-0000-000000000000", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Name",
          age: 40,
        }),
      });
      await expectStatus(res, 404);
    });
  });

  // ============================================================================
  // PROGRAMS TESTS
  // ============================================================================

  describe("Programs", () => {
    test("Generate a program for client", async () => {
      const res = await api("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.program_id).toBeDefined();
      expect(data.program_name).toBeDefined();
      expect(data.duration_weeks).toBeGreaterThan(0);
      expect(data.split_type).toBeDefined();
      expect(data.program_data).toBeDefined();
      programId = data.program_id;
    });

    test("Generate program for non-existent client (404)", async () => {
      const res = await api("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "00000000-0000-0000-0000-000000000000",
        }),
      });
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Generate program with invalid client_id format (400)", async () => {
      const res = await api("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "invalid-uuid",
        }),
      });
      await expectStatus(res, 400);
    });

    test("Generate program with missing client_id (400)", async () => {
      const res = await api("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await expectStatus(res, 400);
    });

    test("Get all programs for client", async () => {
      const res = await api(`/api/programs/client/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].program_name).toBeDefined();
      expect(data[0].duration_weeks).toBeDefined();
      expect(data[0].split_type).toBeDefined();
      expect(data[0].created_at).toBeDefined();
    });

    test("Get programs for non-existent client returns empty array", async () => {
      const res = await api("/api/programs/client/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("Get programs with invalid client_id format (400)", async () => {
      const res = await api("/api/programs/client/invalid-uuid");
      await expectStatus(res, 400);
    });

    test("Get full program with sessions", async () => {
      const res = await api(`/api/programs/${programId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(programId);
      expect(data.client_id).toBe(clientId);
      expect(data.program_name).toBeDefined();
      expect(data.duration_weeks).toBeGreaterThan(0);
      expect(data.sessions).toBeDefined();
      expect(Array.isArray(data.sessions)).toBe(true);
      expect(data.program_data).toBeDefined();
      expect(data.created_at).toBeDefined();
    });

    test("Get non-existent program (404)", async () => {
      const res = await api("/api/programs/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Get program with invalid UUID format (400)", async () => {
      const res = await api("/api/programs/invalid-uuid");
      await expectStatus(res, 400);
    });
  });

  // ============================================================================
  // SESSIONS TESTS
  // ============================================================================

  describe("Sessions", () => {
    test("Get all sessions for program", async () => {
      const res = await api(`/api/sessions/program/${programId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].program_id).toBe(programId);
      expect(data[0].client_id).toBe(clientId);
      expect(data[0].session_name).toBeDefined();
      expect(data[0].exercises).toBeDefined();
      expect(data[0].week_number).toBeDefined();
      expect(data[0].day_number).toBeDefined();
      expect(data[0].completed).toBeDefined();
      expect(data[0].created_at).toBeDefined();
      sessionId = data[0].id;
    });

    test("Get sessions for non-existent program returns empty array", async () => {
      const res = await api("/api/sessions/program/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("Get sessions with invalid program_id format (400)", async () => {
      const res = await api("/api/sessions/program/invalid-uuid");
      await expectStatus(res, 400);
    });

    test("Get session details", async () => {
      const res = await api(`/api/sessions/${sessionId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(sessionId);
      expect(data.program_id).toBe(programId);
      expect(data.client_id).toBe(clientId);
      expect(data.exercises).toBeDefined();
      expect(data.completed).toBeDefined();
      expect(data.week_number).toBeDefined();
      expect(data.day_number).toBeDefined();
      expect(data.session_name).toBeDefined();
      expect(data.created_at).toBeDefined();
    });

    test("Get non-existent session (404)", async () => {
      const res = await api("/api/sessions/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Get session with invalid UUID format (400)", async () => {
      const res = await api("/api/sessions/invalid-uuid");
      await expectStatus(res, 400);
    });

    test("Log exercise to session", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Barbell Squat",
          weight_used: 140,
          reps_completed: 5,
          rpe: 7,
          notes: "Felt strong today",
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.session_id).toBe(sessionId);
      expect(data.client_id).toBe(clientId);
      expect(data.exercise_name).toBe("Barbell Squat");
      expect(data.weight_used).toBe(140);
      expect(data.reps_completed).toBe(5);
      expect(data.rpe).toBe(7);
      expect(data.logged_at).toBeDefined();
      exerciseLogId = data.id;
    });

    test("Log exercise with only required fields", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Leg Press",
          weight_used: 300,
          reps_completed: 8,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.exercise_name).toBe("Leg Press");
      expect(data.rpe).toBeNull();
      expect(data.notes).toBeNull();
    });

    test("Log exercise with valid RPE (minimum)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Deadlift",
          weight_used: 180,
          reps_completed: 3,
          rpe: 1,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.rpe).toBe(1);
    });

    test("Log exercise with valid RPE (maximum)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Bench Press",
          weight_used: 120,
          reps_completed: 4,
          rpe: 10,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.rpe).toBe(10);
    });

    test("Log exercise with invalid RPE (below minimum)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          weight_used: 140,
          reps_completed: 5,
          rpe: 0,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Log exercise with invalid RPE (above maximum)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          weight_used: 140,
          reps_completed: 5,
          rpe: 11,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Log exercise with missing exercise_name (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_used: 140,
          reps_completed: 5,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Log exercise with missing weight_used (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          reps_completed: 5,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Log exercise with missing reps_completed (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          weight_used: 140,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Log exercise to non-existent session (404)", async () => {
      const res = await api(`/api/sessions/00000000-0000-0000-0000-000000000000/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          weight_used: 140,
          reps_completed: 5,
        }),
      });
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Log exercise with invalid session_id format (400)", async () => {
      const res = await api(`/api/sessions/invalid-uuid/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          weight_used: 140,
          reps_completed: 5,
        }),
      });
      await expectStatus(res, 400);
    });

    test("Complete session with exercise data", async () => {
      const res = await api(`/api/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: [
            {
              exercise_name: "Barbell Squat",
              weight_used: 140,
              reps_completed: 5,
              rpe: 7,
            },
            {
              exercise_name: "Leg Press",
              weight_used: 300,
              reps_completed: 8,
              rpe: 6,
              notes: "Good control",
            },
          ],
        }),
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(sessionId);
      expect(data.completed).toBe(true);
      expect(data.completed_at).toBeDefined();
      expect(data.exercises).toBeDefined();
    });

    test("Complete session with single exercise", async () => {
      // Get another session first
      const sessionRes = await api(`/api/sessions/program/${programId}`);
      const sessions = await sessionRes.json();
      const nextSession = sessions.find((s: any) => s.id !== sessionId);

      if (nextSession) {
        const res = await api(`/api/sessions/${nextSession.id}/complete`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercises: [
              {
                exercise_name: "Squat",
                weight_used: 150,
                reps_completed: 5,
              },
            ],
          }),
        });
        await expectStatus(res, 200);
        const data = await res.json();
        expect(data.completed).toBe(true);
      }
    });

    test("Complete session with missing exercises array (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await expectStatus(res, 400);
    });

    test("Complete session with empty exercises array (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: [],
        }),
      });
      await expectStatus(res, 400);
    });

    test("Complete non-existent session (404)", async () => {
      const res = await api(`/api/sessions/00000000-0000-0000-0000-000000000000/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: [
            {
              exercise_name: "Squat",
              weight_used: 140,
              reps_completed: 5,
            },
          ],
        }),
      });
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Complete session with invalid session_id format (400)", async () => {
      const res = await api(`/api/sessions/invalid-uuid/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: [
            {
              exercise_name: "Squat",
              weight_used: 140,
              reps_completed: 5,
            },
          ],
        }),
      });
      await expectStatus(res, 400);
    });

    test("Complete session with exercise missing required field (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: [
            {
              exercise_name: "Squat",
              weight_used: 140,
              // missing reps_completed
            },
          ],
        }),
      });
      await expectStatus(res, 400);
    });
  });

  // ============================================================================
  // EXERCISES TESTS
  // ============================================================================

  describe("Exercises", () => {
    test("Get alternative exercises", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Barbell+Squat&muscle_group=Quads&equipment=Barbell&client_id=${clientId}`
      );
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        expect(data[0].name).toBeDefined();
        expect(data[0].muscle_group).toBeDefined();
        expect(data[0].equipment).toBeDefined();
        expect(data[0].difficulty).toBeDefined();
        expect(data[0].reason).toBeDefined();
      }
    });

    test("Get alternative exercises with URL encoding", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Bench%20Press&muscle_group=Chest&equipment=Barbell&client_id=${clientId}`
      );
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test("Get alternatives with missing exercise_name (400)", async () => {
      const res = await api(
        `/api/exercises/swap?muscle_group=Quads&equipment=Barbell&client_id=${clientId}`
      );
      await expectStatus(res, 400);
    });

    test("Get alternatives with missing muscle_group (400)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&equipment=Barbell&client_id=${clientId}`
      );
      await expectStatus(res, 400);
    });

    test("Get alternatives with missing equipment (400)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&muscle_group=Quads&client_id=${clientId}`
      );
      await expectStatus(res, 400);
    });

    test("Get alternatives with missing client_id (400)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&muscle_group=Quads&equipment=Barbell`
      );
      await expectStatus(res, 400);
    });

    test("Get alternatives for non-existent client (404)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&muscle_group=Quads&equipment=Barbell&client_id=00000000-0000-0000-0000-000000000000`
      );
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Get alternatives with invalid UUID format (400)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&muscle_group=Quads&equipment=Barbell&client_id=invalid-uuid`
      );
      await expectStatus(res, 400);
    });
  });

  // ============================================================================
  // ANALYTICS TESTS
  // ============================================================================

  describe("Analytics", () => {
    test("Get client analytics", async () => {
      const res = await api(`/api/analytics/client/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.compliance_rate).toBeDefined();
      expect(data.total_sessions).toBeDefined();
      expect(data.completed_sessions).toBeDefined();
      expect(data.strength_progress).toBeDefined();
      expect(data.muscle_group_volume).toBeDefined();
      expect(data.last_workout_date).toBeDefined();
    });

    test("Get client analytics has correct structure", async () => {
      const res = await api(`/api/analytics/client/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(typeof data.compliance_rate).toBe("number");
      expect(typeof data.total_sessions).toBe("number");
      expect(typeof data.completed_sessions).toBe("number");
      expect(typeof data.strength_progress).toBe("object");
      expect(typeof data.muscle_group_volume).toBe("object");
    });

    test("Get client analytics has strength progress structure", async () => {
      const res = await api(`/api/analytics/client/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.strength_progress).toEqual(expect.any(Object));
      if (Object.keys(data.strength_progress).length > 0) {
        expect(data.strength_progress.squat).toBeDefined();
        expect(data.strength_progress.bench).toBeDefined();
        expect(data.strength_progress.deadlift).toBeDefined();
      }
    });

    test("Get analytics for non-existent client (404)", async () => {
      const res = await api("/api/analytics/client/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Get analytics with invalid UUID format (400)", async () => {
      const res = await api("/api/analytics/client/invalid-uuid");
      await expectStatus(res, 400);
    });
  });

  // ============================================================================
  // CLEANUP TESTS
  // ============================================================================

  describe("Cleanup", () => {
    test("Delete program", async () => {
      const res = await api(`/api/programs/${programId}`, {
        method: "DELETE",
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    test("Verify program is deleted (404)", async () => {
      const res = await api(`/api/programs/${programId}`);
      await expectStatus(res, 404);
    });

    test("Delete non-existent program (404)", async () => {
      const res = await api(`/api/programs/00000000-0000-0000-0000-000000000000`, {
        method: "DELETE",
      });
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Delete program with invalid UUID format (400)", async () => {
      const res = await api(`/api/programs/invalid-uuid`, {
        method: "DELETE",
      });
      await expectStatus(res, 400);
    });

    test("Delete client", async () => {
      const res = await api(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    test("Verify client is deleted (404)", async () => {
      const res = await api(`/api/clients/${clientId}`);
      await expectStatus(res, 404);
    });

    test("Delete non-existent client (404)", async () => {
      const res = await api(`/api/clients/00000000-0000-0000-0000-000000000000`, {
        method: "DELETE",
      });
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Delete client with invalid UUID format (400)", async () => {
      const res = await api(`/api/clients/invalid-uuid`, {
        method: "DELETE",
      });
      await expectStatus(res, 400);
    });
  });
});
