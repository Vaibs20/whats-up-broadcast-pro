export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join campaign room for real-time updates
    socket.on('join-campaign', (campaignId) => {
      socket.join(`campaign-${campaignId}`);
      console.log(`Socket ${socket.id} joined campaign room: ${campaignId}`);
    });

    // Leave campaign room
    socket.on('leave-campaign', (campaignId) => {
      socket.leave(`campaign-${campaignId}`);
      console.log(`Socket ${socket.id} left campaign room: ${campaignId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Helper function to emit to specific campaign room
  io.emitToCampaign = (campaignId, event, data) => {
    io.to(`campaign-${campaignId}`).emit(event, data);
  };
};