/**
 * Tag'ų seedinimo skriptas — Sprint A
 *
 * Paskirtis:
 *   Sukuria 12 pradinių tag'ų (6 OCCASION + 6 INDUSTRY) su pilnu LT
 *   turiniu (SEO description, hero text landing puslapiui).
 *
 * Paleidimas:
 *   cd D:\ProgramavimoDarbai\e-printukas\backend
 *   node scripts/seed-tags.js
 *
 * Po paleidimo:
 *   - 12 tag'ų DB
 *   - upsert'as — pakartotinis paleidimas neduplikuoja, bet atnaujina turinį
 *
 * Tag'ai dar neturi produktų — tai darysim Sprint D
 * (eksistuojantis Roly produktų tag'avimas + Stamina importas).
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OCCASION_TAGS = [
  {
    slug: "verslo-dovanos",
    name: "Verslo dovanos klientams",
    type: "OCCASION",
    description:
      "Verslo dovanos klientams su jūsų logotipu. Profesionali apranga, gertuvės, biuro prekės — produktai, kuriuos jūsų klientai naudos kasdien.",
    heroText:
      "Įsimintinos verslo dovanos su jūsų prekės ženklu. Nuo praktinių iki prabangių — surinkome geriausius pasirinkimus klientams, partneriams ir tiekėjams.",
    sortOrder: 1,
  },
  {
    slug: "kaledos",
    name: "Kalėdos ir šventės",
    type: "OCCASION",
    description:
      "Kalėdinės dovanos darbuotojams ir klientams. Sezoninės kolekcijos su jūsų logotipu — užsakymai priimami nuo lapkričio.",
    heroText:
      "Kalėdiniai pasiūlymai jūsų komandai. Šilta apranga, šventiniai aksesuarai ir patys naudingiausi sprendimai — pristatymas iki šventės.",
    sortOrder: 2,
  },
  {
    slug: "konferencijos-renginiai",
    name: "Konferencijos ir renginiai",
    type: "OCCASION",
    description:
      "Reklaminė tekstilė ir aksesuarai konferencijoms, renginiams, parodoms. T-shirt'ai personalui, dovanos dalyviams, baneriai.",
    heroText:
      "Pasiruošimas renginiui. Marškinėliai personalui, dovanos lankytojams, atributika sponsoriams — viskas su jūsų brendingu.",
    sortOrder: 3,
  },
  {
    slug: "welcome-kit",
    name: "Welcome kit naujam darbuotojui",
    type: "OCCASION",
    description:
      "Welcome kit naujiems darbuotojams. Marškinėliai, gertuvė, kuprinė, užrašinė — pirmos dienos įspūdis su jūsų logotipu.",
    heroText:
      "Pirmoji diena su pasitikėjimu. Surenkime welcome paketą, kuris parodo, kad jūsų įmonė rūpinasi savo komanda nuo pirmos minutės.",
    sortOrder: 4,
  },
  {
    slug: "imones-jubiliejus",
    name: "Įmonės jubiliejus",
    type: "OCCASION",
    description:
      "Įmonės jubiliejaus dovanos. Ilgalaikiams darbuotojams, klientams ir partneriams — atminimo ženklas su jūsų logotipu.",
    heroText:
      "Įmonės sukaktis nutinka kartą. Memorial dovanos darbuotojams su staža, klientams partneriams — ilgalaikis prisiminimas su jūsų prekės ženklu.",
    sortOrder: 5,
  },
  {
    slug: "merch-kolekcija",
    name: "Firminis merch'as",
    type: "OCCASION",
    description:
      "Firminis merch'as komandos kultūrai. Marškinėliai, džemperiai, aksesuarai — drabužiai, kuriuos darbuotojai mielai dėvi.",
    heroText:
      "Brand'as, kurį dėvėti norisi. Merch'as nėra tik logotipas ant medvilnės — tai komandos identitetas, kuris matomas viduje ir lauke.",
    sortOrder: 6,
  },
];

const INDUSTRY_TAGS = [
  {
    slug: "horeca",
    name: "HORECA — restoranai, viešbučiai, kavinės",
    type: "INDUSTRY",
    description:
      "Apranga ir aksesuarai HORECA sektoriui — restoranams, viešbučiams, kavinėms. Personalo uniformos, padavėjų prijuostės, virėjų striukės.",
    heroText:
      "Aprangos sprendimai HORECA verslui. Padavėjų polo, virėjų striukės, prijuostės su jūsų logotipu — patogus, atsparus, profesionalus.",
    sortOrder: 1,
  },
  {
    slug: "statyba-pramone",
    name: "Statyba ir pramonė",
    type: "INDUSTRY",
    description:
      "Darbo drabužiai ir signalinė apranga statybų ir pramonės sektoriui. Saugumas, atsparumas, jūsų logotipo akcentas.",
    heroText:
      "Apranga, kuri dirba sunkiausiomis sąlygomis. Signaliniai, atsparūs darbo drabužiai pramonei — atitinka saugos reikalavimus.",
    sortOrder: 2,
  },
  {
    slug: "sveikata-grozis",
    name: "Sveikata ir grožis",
    type: "INDUSTRY",
    description:
      "Medicininiai chalatai, masažuotojų polo, grožio salonų uniformos su logotipu. Higieniški audiniai, profesionalus įvaizdis.",
    heroText:
      "Pacientai pasitiki tuo, ką mato. Profesionali apranga medicinos ir grožio sektoriui — higieniška, patogi, su jūsų prekės ženklu.",
    sortOrder: 3,
  },
  {
    slug: "sportas-fitness",
    name: "Sporto klubai ir fitness",
    type: "INDUSTRY",
    description:
      "Sportinė apranga klubams, treneriams, fitness studijoms. Komandos vienybė per stilingą uniformą su logotipu.",
    heroText:
      "Klubo dvasia per uniformą. Sportinė apranga komandoms, treneriams, instruktoriams — kvėpuojantys audiniai, ilgaamžė spauda.",
    sortOrder: 4,
  },
  {
    slug: "svietimas",
    name: "Mokyklos ir universitetai",
    type: "INDUSTRY",
    description:
      "Aprangos sprendimai švietimo įstaigoms. Mokyklų uniformos, universitetų merch'as, sporto komandų aprangos.",
    heroText:
      "Bendruomenės jausmas per drabužį. Mokyklų ir universitetų merch'as, sporto komandų uniformos, renginių marškinėliai.",
    sortOrder: 5,
  },
  {
    slug: "it-finansai",
    name: "IT ir finansų sektorius",
    type: "INDUSTRY",
    description:
      "Firminis merch'as IT ir finansų įmonėms. Polo, džemperiai, aksesuarai — komandos identitetas modernioms įmonėms.",
    heroText:
      "Tech kultūra reikalauja brand'o. IT ir finansų komandų merch'as — modernus, kokybiškas, atspindintis jūsų įmonės dvasią.",
    sortOrder: 6,
  },
];

async function main() {
  console.log("🏷️  Tag'ų seedinimas — Sprint A\n");

  const allTags = [...OCCASION_TAGS, ...INDUSTRY_TAGS];
  let created = 0;
  let updated = 0;

  for (const tagData of allTags) {
    const existing = await prisma.tag.findUnique({
      where: { slug: tagData.slug },
    });

    if (existing) {
      await prisma.tag.update({
        where: { slug: tagData.slug },
        data: tagData,
      });
      updated++;
      console.log(`  🔄 ${tagData.slug.padEnd(28, " ")} (atnaujinta)`);
    } else {
      await prisma.tag.create({ data: tagData });
      created++;
      console.log(`  ✅ ${tagData.slug.padEnd(28, " ")} (sukurta)`);
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`📊 Iš viso: ${allTags.length} tag'ų`);
  console.log(`   Sukurta:    ${created}`);
  console.log(`   Atnaujinta: ${updated}`);
  console.log("═".repeat(50));

  // Statistika DB'oje
  const totalInDb = await prisma.tag.count();
  const occasionCount = await prisma.tag.count({ where: { type: "OCCASION" } });
  const industryCount = await prisma.tag.count({ where: { type: "INDUSTRY" } });

  console.log(`\n✓ DB iš viso: ${totalInDb} tag'ų`);
  console.log(`  OCCASION: ${occasionCount}`);
  console.log(`  INDUSTRY: ${industryCount}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("FATAL ERROR:", error);
  prisma.$disconnect();
  process.exit(1);
});
