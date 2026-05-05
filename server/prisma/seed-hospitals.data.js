const cities = [
  "Ljubljana",
  "Maribor",
  "Celje",
  "Koper",
  "Kranj",
  "Novo Mesto",
  "Nova Gorica",
  "Murska Sobota",
  "Jesenice",
  "Ptuj",
  "Velenje",
  "Izola",
  "Trbovlje",
  "Slovenj Gradec",
  "Brezice",
  "Sezana",
];

const specialties = [
  { specialty: "Radiology", procedures: ["Knee MRI", "Spine MRI", "CT scan consult"] },
  { specialty: "Dermatology", procedures: ["Skin lesion exam", "Dermoscopy", "Acne consult"] },
  { specialty: "Cardiology", procedures: ["Cardiology consult", "ECG check", "Heart ultrasound"] },
  { specialty: "Orthopedics", procedures: ["Knee pain exam", "Hip pain exam", "Shoulder exam"] },
  { specialty: "Neurology", procedures: ["Headache consult", "Neurology consult", "Nerve test"] },
  { specialty: "Gynecology", procedures: ["Gynecology consult", "Preventive exam", "Ultrasound exam"] },
];

const baseHospitals = [
  {
    name: "University Medical Centre Ljubljana",
    city: "Ljubljana",
    country: "Slovenia",
    website: "https://www.kclj.si/",
    emergency24h: true,
    bedCount: 2100,
    averageWaitDays: 42,
  },
  {
    name: "University Medical Centre Maribor",
    city: "Maribor",
    country: "Slovenia",
    website: "https://www.ukc-mb.si/en/",
    emergency24h: true,
    bedCount: 1316,
    averageWaitDays: 39,
  },
  {
    name: "General Hospital Celje",
    city: "Celje",
    country: "Slovenia",
    website: "https://sb-celje.si/",
    emergency24h: true,
    bedCount: 700,
    averageWaitDays: 31,
  },
  {
    name: "General Hospital Novo Mesto",
    city: "Novo Mesto",
    country: "Slovenia",
    website: "https://www.sb-nm.si/en/about-hospital",
    emergency24h: true,
    bedCount: 394,
    averageWaitDays: 29,
  },
  {
    name: "General Hospital Nova Gorica",
    city: "Nova Gorica",
    country: "Slovenia",
    website: "https://www.bolnisnica-go.si/",
    emergency24h: true,
    bedCount: 320,
    averageWaitDays: 27,
  },
];

function buildServices(index) {
  return [0, 1, 2].map((shift) => {
    const bucket = specialties[(index + shift) % specialties.length];
    return {
      specialty: bucket.specialty,
      procedureName: bucket.procedures[(index + shift) % bucket.procedures.length],
      estimatedWaitDays: 10 + ((index * 7 + shift * 5) % 45),
    };
  });
}

const generatedHospitals = [];
let cursor = 0;
while (generatedHospitals.length + baseHospitals.length < 50) {
  const city = cities[cursor % cities.length];
  const serial = String(generatedHospitals.length + 1).padStart(2, "0");
  generatedHospitals.push({
    name: `Regional Health Centre ${city} ${serial}`,
    city,
    country: "Slovenia",
    website: null,
    emergency24h: cursor % 3 === 0 ? true : null,
    bedCount: cursor % 4 === 0 ? 120 + ((cursor * 9) % 280) : null,
    averageWaitDays: 14 + ((cursor * 3) % 36),
  });
  cursor += 1;
}

const hospitalsSeed = [...baseHospitals, ...generatedHospitals].map((hospital, index) => ({
  ...hospital,
  services: buildServices(index),
}));

module.exports = { hospitalsSeed };
