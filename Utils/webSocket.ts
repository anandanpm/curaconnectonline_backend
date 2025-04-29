
import { Server } from "socket.io";
import http from "http";

interface OnlineUser {
  userId: string;
  socketId: string;
  userType: 'doctor' | 'patient';
  lastActive: Date;
}

const initWebSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    // Track online users (doctors and patients)
    const onlineUsers: Record<string, OnlineUser> = {};

    io.on("connection", (socket) => {
        console.log("User connected", socket.id);
        
        // User authentication and joining personal room
        socket.on("joinChat", (userId: string) => {
            console.log(`User ${userId} joined their room`);
            socket.join(userId);
        });

        // Track doctor's online status
        socket.on("doctorOnline", (doctorId: string) => {
            console.log(`Doctor ${doctorId} is now online`);
            
            onlineUsers[doctorId] = {
                userId: doctorId,
                socketId: socket.id,
                userType: 'doctor',
                lastActive: new Date()
            };
            
            // Broadcast to all clients that this doctor is online
            io.emit("doctorStatusChanged", {
                doctorId,
                isOnline: true,
                timestamp: new Date()
            });
        });

        // Handle messaging
        socket.on("sendMessage", (data) => {
            io.to(data.receiverId).emit("receiveMessage", data);
        });

        // Handle new appointment bookings
        socket.on("newAppointmentBooked", (data) => {
            console.log(`New appointment booked for doctor ${data.doctorId}`);
            // Emit to doctor's room
            io.to(data.doctorId).emit("newAppointment", {
                appointmentDate: data.appointmentDate,
                appointmentTime: data.appointmentTime,
                appointmentId: data.appointmentId,
                patientId: data.patientId,
                patientName: data.patientName
            });
        });

        socket.on("callNotification", (data) => {
            console.log(`Doctor ${data.doctorName} started call for patient ${data.userId} and the room id is ${data.roomId}`);
            // Emit to specific user's room instead of broadcasting to everyone
            io.to(data.userId).emit("callNotificationemit", data);
            console.log(`Emitting callNotificationemit to user ${data.userId}`);
            
            // Send acknowledgment back to the doctor
            io.to(data.doctorId).emit("callNotificationSent", {
                success: true,
                userId: data.userId,
                timestamp: new Date()
            });
        });

        socket.on("callAccepted", (data) => {
            console.log(`Call accepted by patient ${data.userId} for room ${data.roomId}`);
            // Notify doctor that call was accepted
            io.to(data.doctorId).emit("callAccepted", data);
        });

        socket.on("callDeclined", (data) => {
            console.log(`Call declined by patient ${data.userId}`);
            // Notify doctor that call was declined
            io.to(data.doctorId).emit("callDeclined", data);
        });

        // Keep-alive ping to maintain accurate online status
        socket.on("heartbeat", (userId: string, userType: 'doctor' | 'patient') => {
            if (userId && onlineUsers[userId]) {
                onlineUsers[userId].lastActive = new Date();
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
            
            // Find user by socket id
            const userEntry = Object.entries(onlineUsers).find(
                ([_, userData]) => userData.socketId === socket.id
            );
            
            if (userEntry) {
                const [userId, userData] = userEntry;
                console.log(`User ${userId} (${userData.userType}) went offline`);
                
                // Remove from online users
                delete onlineUsers[userId];
                
                // If it was a doctor, broadcast offline status
                if (userData.userType === 'doctor') {
                    io.emit("doctorStatusChanged", {
                        doctorId: userId,
                        isOnline: false,
                        timestamp: new Date()
                    });
                }
            }
        });
    });
    
    // Clean up stale sessions (users who didn't properly disconnect)
    setInterval(() => {
        const now = new Date();
        const staleThreshold = 60000; // 1 minute without heartbeat = offline
        
        Object.entries(onlineUsers).forEach(([userId, userData]) => {
            const timeDiff = now.getTime() - userData.lastActive.getTime();
            
            if (timeDiff > staleThreshold) {
                console.log(`User ${userId} (${userData.userType}) timed out after inactivity`);
                delete onlineUsers[userId];
                
                // If it was a doctor, broadcast offline status
                if (userData.userType === 'doctor') {
                    io.emit("doctorStatusChanged", {
                        doctorId: userId,
                        isOnline: false,
                        timestamp: new Date()
                    });
                }
            }
        });
    }, 30000); 
    
    return io;
};

export default initWebSocket;