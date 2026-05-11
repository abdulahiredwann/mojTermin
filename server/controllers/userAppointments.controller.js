const prisma = require("../prisma/prisma");

async function listMyAppointmentRequests(req, res, next) {
  try {
    const rows = await prisma.appointmentRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        hospital: {
          select: { id: true, name: true, city: true, country: true },
        },
      },
    });

    const requests = rows.map((r) => ({
      id: r.id,
      email: r.email,
      query: r.query,
      intent: r.intent,
      city: r.city,
      hospitalId: r.hospitalId,
      hospitalName: r.hospitalName ?? r.hospital?.name ?? null,
      preferredDate: r.preferredDate,
      notifyWhenAvailable: r.notifyWhenAvailable,
      status: r.status,
      createdAt: r.createdAt,
    }));

    const byStatus = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    return res.json({
      stats: {
        total: requests.length,
        byStatus,
      },
      requests,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listMyAppointmentRequests };
