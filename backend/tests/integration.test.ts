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
    test("Create a new client", async () => {
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
          injuries: "None",
          preferredExercises: "Compound movements",
          bodyFatPercentage: 15,
          squat1rm: 140,
          bench1rm: 100,
          deadlift1rm: 180,
        }),
      });
      await expectStatus(res, 201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe("John Doe");
      expect(data.age).toBe(30);
      clientId = data.id;
    });

    test("Get all clients", async () => {
      const res = await api("/api/clients");
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].name).toBeDefined();
    });

    test("Get client by ID", async () => {
      const res = await api(`/api/clients/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.id).toBe(clientId);
      expect(data.name).toBe("John Doe");
      expect(data.height).toBe(180);
      expect(data.weight).toBeDefined();
    });

    test("Update client profile", async () => {
      const res = await api(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Smith",
          age: 31,
          weight: 87,
          goals: "Lose fat and maintain strength",
        }),
      });
      await expectStatus(res, 200);
      const data = await res.json();
      expect(data.name).toBe("John Smith");
      expect(data.age).toBe(31);
      expect(data.weight).toBeDefined();
    });

    test("Get non-existent client (404)", async () => {
      const res = await api("/api/clients/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    test("Create client with missing required fields (400)", async () => {
      const res = await api("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Incomplete Client",
          age: 25,
          // missing other required fields
        }),
      });
      await expectStatus(res, 400);
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
    });

    test("Get all programs for client", async () => {
      const res = await api(`/api/programs/client/${clientId}`);
      await expectStatus(res, 200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].program_name).toBeDefined();
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
    });

    test("Get non-existent program (404)", async () => {
      const res = await api("/api/programs/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
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
      sessionId = data[0].id;
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
    });

    test("Get non-existent session (404)", async () => {
      const res = await api("/api/sessions/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
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
      expect(data.logged_at).toBeDefined();
      exerciseLogId = data.id;
    });

    test("Log exercise with missing required fields (400)", async () => {
      const res = await api(`/api/sessions/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_name: "Squat",
          // missing weight_used and reps_completed
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
      }
    });

    test("Get alternatives for non-existent client (404)", async () => {
      const res = await api(
        `/api/exercises/swap?exercise_name=Squat&muscle_group=Quads&equipment=Barbell&client_id=00000000-0000-0000-0000-000000000000`
      );
      await expectStatus(res, 404);
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
    });

    test("Get analytics for non-existent client (404)", async () => {
      const res = await api("/api/analytics/client/00000000-0000-0000-0000-000000000000");
      await expectStatus(res, 404);
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
    });

    test("Delete non-existent program (404)", async () => {
      const res = await api(`/api/programs/00000000-0000-0000-0000-000000000000`, {
        method: "DELETE",
      });
      await expectStatus(res, 404);
    });
  });
});
