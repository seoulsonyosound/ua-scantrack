import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "../screens/LoginScreen";

// Student Admin (mobile-only)
import { PinLoginScreen } from "../screens/studentAdmin/PinLoginScreen";
import { ScannerScreen } from "../screens/studentAdmin/ScannerScreen";
import { SummaryScreen } from "../screens/studentAdmin/SummaryScreen";

// Student
import { StudentHomeScreen } from "../screens/student/StudentHomeScreen";
import { EventsListScreen } from "../screens/student/EventsListScreen";
import { EventDetailsScreen } from "../screens/student/EventDetailsScreen";
import { AttendeesScreen } from "../screens/student/AttendeesScreen";
import { StudentProfileScreen } from "../screens/student/StudentProfileScreen";
import { StudentAttendanceHistoryScreen } from "../screens/student/StudentAttendanceHistoryScreen";

// Admin
import { AdminHomeScreen } from "../screens/admin/AdminHomeScreen";
import { ManageEventsScreen } from "../screens/admin/ManageEventsScreen";
import { CreateEventScreen } from "../screens/admin/CreateEventScreen";
import { ManageAttendanceScreen } from "../screens/admin/ManageAttendanceScreen";
import { AdminReportsScreen } from "../screens/admin/AdminReportsScreen";

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Demo Login */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />

      {/* Student Admin (PIN scanner is still accessible without login) */}
      <Stack.Screen name="PinLogin" component={PinLoginScreen} options={{ title: "Student Admin Portal" }} />
      <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: "Scan Attendance" }} />
      <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: "Event Summary" }} />

      {/* Student */}
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} options={{ title: "Student" }} />
      <Stack.Screen name="StudentEvents" component={EventsListScreen} options={{ title: "Upcoming Events" }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: "Event Details" }} />
      <Stack.Screen name="Attendees" component={AttendeesScreen} options={{ title: "Attendees" }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: "My Profile" }} />
      <Stack.Screen
        name="StudentAttendanceHistory"
        component={StudentAttendanceHistoryScreen}
        options={{ title: "My Attendance" }}
      />

      {/* Admin */}
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Admin" }} />
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} options={{ title: "Manage Events" }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: "Create Event" }} />
      <Stack.Screen name="ManageAttendance" component={ManageAttendanceScreen} options={{ title: "Attendance Records" }} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: "Reports" }} />
    </Stack.Navigator>
  );
}