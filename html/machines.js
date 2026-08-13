(() => {
  "use strict";

  const local = (en, nl) => ({ en, nl });
  const group = (id, en, nl) => ({ id, label: local(en, nl) });
  const programme = (id, en, nl, minutes, groupId) => ({ id, label: local(en, nl), minutes, group: groupId });

  window.LaundryMachines = [
    {
      id: "samsung-wf-y4bk-b4bk",
      brand: "Samsung",
      model: "WF702Y4BKWQ/EN",
      option: local("Samsung WF702Y4BKWQ/EN (WF/600–702 Y4BK/B4BK)", "Samsung WF702Y4BKWQ/EN (WF/600–702 Y4BK/B4BK)"),
      timer: local("Delay End", "Uitgesteld einde"),
      timerRange: { min: 3, max: 19, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 18,
      defaultProgram: "dark",
      groups: [group("dial", "Dial programmes", "Draaiknopprogramma’s"), group("quick", "Quick wash button", "Knop Kort programma")],
      manual: local("Samsung manual · page 37", "Samsung-handleiding · pagina 37"),
      reference: local(
        "Official Samsung baseline durations. Quick wash can be selected at 15, 20, 30, 40, 50 or 60 minutes. Actual times can vary with water pressure and temperature, load, fabric and selected options. <a class=\"source-link\" href=\"https://www.samsung.com/nl/support/model.WF702Y4BKWQ_EN/\" rel=\"noreferrer\">Official Samsung support page</a>.",
        "Officiële Samsung-basistijden. Kort programma is instelbaar op 15, 20, 30, 40, 50 of 60 minuten. De werkelijke duur kan variëren door waterdruk en -temperatuur, belading, textiel en gekozen opties. <a class=\"source-link\" href=\"https://www.samsung.com/nl/support/model.WF702Y4BKWQ_EN/\" rel=\"noreferrer\">Officiële Samsung-supportpagina</a>."
      ),
      programs: [
        programme("cotton", "Cotton", "Katoen", 133, "dial"),
        programme("synthetics", "Synthetics", "Synthetisch", 105, "dial"),
        programme("jeans", "Jeans", "Jeans", 77, "dial"),
        programme("bedding", "Bedding", "Beddengoed", 100, "dial"),
        programme("dark", "Dark garments", "Donkere kleding", 78, "dial"),
        programme("daily", "Daily wash", "Dagelijkse was", 66, "dial"),
        programme("drum", "Eco drum clean", "Eco trommelreiniging", 104, "dial"),
        programme("baby", "Baby care", "Babykleding", 142, "dial"),
        programme("sports", "Outdoor care", "Outdoorkleding", 72, "dial"),
        programme("hand", "Hand wash", "Handwas", 30, "dial"),
        programme("wool", "Wool", "Wol", 38, "dial"),
        ...[15, 20, 30, 40, 50, 60].map((minutes) => programme(`quick-${minutes}`, "Quick wash", "Kort programma", minutes, "quick"))
      ]
    },
    {
      id: "bosch-wae284a7nl-12",
      brand: "Bosch",
      model: "WAE284A7NL/12",
      option: local("Bosch WAE284A7NL/12 (Maxx 7 VarioPerfect)", "Bosch WAE284A7NL/12 (Maxx 7 VarioPerfect)"),
      timer: local("Ready in", "Klaar in"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "cotton-40",
      groups: [group("cotton", "Cotton settings", "Katoeninstellingen"), group("other", "Other documented settings", "Andere gedocumenteerde instellingen")],
      manual: local("Bosch WAE284A7 / Maxx 7 programme table", "Bosch WAE284A7 / Maxx 7-programmatabel"),
      reference: local(
        "Documented baseline/test settings for this Bosch profile. The manual says programme duration can change as the wash is optimised. Use the measured-time field when the display differs. <a class=\"source-link\" href=\"https://www.bosch-home.nl/nl/productservice/WAE284A7NL-12\" rel=\"noreferrer\">Official Bosch model page</a>.",
        "Gedocumenteerde basis-/testinstellingen voor dit Bosch-profiel. Volgens de handleiding kan de programmaduur veranderen terwijl de was wordt geoptimaliseerd. Gebruik het gemeten-tijdveld als het display afwijkt. <a class=\"source-link\" href=\"https://www.bosch-home.nl/nl/productservice/WAE284A7NL-12\" rel=\"noreferrer\">Officiële Bosch-modelpagina</a>."
      ),
      programs: [
        programme("cotton-20", "Cotton 20 °C", "Katoen 20 °C", 150, "cotton"),
        programme("cotton-30", "Cotton 30 °C", "Katoen 30 °C", 150, "cotton"),
        programme("cotton-40", "Cotton 40 °C", "Katoen 40 °C", 150, "cotton"),
        programme("cotton-60", "Cotton 60 °C", "Katoen 60 °C", 165, "cotton"),
        programme("cotton-90", "Cotton 90 °C", "Katoen 90 °C", 165, "cotton"),
        programme("easy-care-40", "Easy-care 40 °C", "Kreukherstellend 40 °C", 105, "other"),
        programme("quick-mix-40", "Quick/Mix 40 °C", "Snel/Mix 40 °C", 75, "other"),
        programme("delicates-30", "Delicates/Silk 30 °C", "Fijne was/Zijde 30 °C", 45, "other"),
        programme("wool-30", "Wool 30 °C", "Wol 30 °C", 45, "other"),
        programme("super-quick-15", "Super quick 15′", "Extra snel 15′", 15, "other")
      ]
    },
    {
      id: "hisense-wf3s8043bw3-blx",
      brand: "Hisense",
      model: "WF3S8043BW3/BLX",
      option: local("Hisense WF3S8043BW3/BLX", "Hisense WF3S8043BW3/BLX"),
      timer: local("Delay End", "Einde vertraging"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "power-wash-49",
      groups: [group("main", "Documented programmes", "Gedocumenteerde programma’s")],
      manual: local("Hisense WF3S8043BW3 programme and product data", "Hisense WF3S8043BW3-programma- en productgegevens"),
      reference: local(
        "Manufacturer-published baseline values; temperature and options can alter the displayed time. Delay End is selectable up to 24 hours and values shorter than the chosen cycle are skipped by this planner. <a class=\"source-link\" href=\"https://nl.hisense.com/producten/wassen-en-drogen/wasmachines/WASHER-WF3S8043BW3-WF3S8043BW3-BLX-HSN/p/000000000020013444\" rel=\"noreferrer\">Official Hisense product page</a>.",
        "Door de fabrikant gepubliceerde basistijden; temperatuur en opties kunnen de getoonde duur veranderen. Einde vertraging is instelbaar tot 24 uur en waarden korter dan het gekozen programma worden door deze planner overgeslagen. <a class=\"source-link\" href=\"https://nl.hisense.com/producten/wassen-en-drogen/wasmachines/WASHER-WF3S8043BW3-WF3S8043BW3-BLX-HSN/p/000000000020013444\" rel=\"noreferrer\">Officiële Hisense-productpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 218, "main"),
        programme("cotton-20", "Cotton 20 °C", "Katoen 20 °C", 138, "main"),
        programme("cotton-60", "Cotton 60 °C", "Katoen 60 °C", 218, "main"),
        programme("synthetics-40", "Synthetics 40 °C", "Synthetisch 40 °C", 153, "main"),
        programme("quick-15", "Quick 15′", "Snel 15′", 15, "main"),
        programme("power-wash-49", "Power Wash 49′", "Power Wash 49′", 49, "main")
      ]
    },
    {
      id: "aeg-lf628600",
      brand: "AEG",
      model: "LF628600",
      option: local("AEG LF628600", "AEG LF628600"),
      timer: local("Delay Start", "Startuitstel"),
      timerRange: { min: 0.5, max: 20, mode: "start", choices: [0.5, 1, 1.5, ...Array.from({ length: 19 }, (_, index) => index + 2)] },
      timerIncrements: local("30-minute steps to 90 minutes, then whole hours", "stappen van 30 minuten tot 90 minuten, daarna hele uren"),
      prewashMinutes: 0,
      defaultProgram: "20-min-3kg",
      groups: [group("main", "Documented programmes", "Gedocumenteerde programma’s")],
      manual: local("AEG LF628600 manual · pages 15 and 36–37", "AEG LF628600-handleiding · pagina’s 15 en 36–37"),
      reference: local(
        "The manual's Eco value is regulatory; its common-programme values are explicitly indicative and can change with load sensing and options. This model delays the start—not the end. <a class=\"source-link\" href=\"https://www.aeg.nl/laundry/laundry/washing-machines/front-loader-washing-machine/lf628600/\" rel=\"noreferrer\">Official AEG product page</a>.",
        "De Eco-waarde in de handleiding is wettelijk bepaald; de waarden voor gangbare programma’s zijn nadrukkelijk indicatief en kunnen veranderen door beladingsmeting en opties. Dit model stelt de start uit, niet het einde. <a class=\"source-link\" href=\"https://www.aeg.nl/laundry/laundry/washing-machines/front-loader-washing-machine/lf628600/\" rel=\"noreferrer\">Officiële AEG-productpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 205, "main"),
        programme("cotton-95", "Cotton 95 °C", "Katoen 95 °C", 245, "main"),
        programme("cotton-60", "Cotton 60 °C", "Katoen 60 °C", 230, "main"),
        programme("cotton-20", "Cotton 20 °C", "Katoen 20 °C", 170, "main"),
        programme("synthetics-40", "Synthetics 40 °C", "Synthetica 40 °C", 135, "main"),
        programme("delicates-30", "Delicates 30 °C", "Fijne was 30 °C", 75, "main"),
        programme("wool-silk-30", "Wool/Silk 30 °C", "Wol/Zijde 30 °C", 65, "main"),
        programme("20-min-3kg", "20 min. – 3 kg", "20 min. – 3 kg", 20, "main")
      ]
    },
    {
      id: "samsung-ww11dg5b25ab",
      brand: "Samsung",
      model: "WW11DG5B25AB",
      option: local("Samsung WW11DG5B25AB", "Samsung WW11DG5B25AB"),
      timer: local("Delay End", "Uitgesteld einde"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "super-speed-39",
      groups: [group("main", "Documented programmes", "Gedocumenteerde programma’s")],
      manual: local("Samsung WW11DG5B25AB product data and manual", "Samsung WW11DG5B25AB-productgegevens en handleiding"),
      reference: local(
        "Official standard/default programme values. Load sensing, temperature and options can change actual duration. <a class=\"source-link\" href=\"https://www.samsung.com/nl/support/model/WW1UDG5B25ABEN/\" rel=\"noreferrer\">Official Samsung support page</a>.",
        "Officiële standaard-/basiswaarden. Beladingsmeting, temperatuur en opties kunnen de werkelijke duur veranderen. <a class=\"source-link\" href=\"https://www.samsung.com/nl/support/model/WW1UDG5B25ABEN/\" rel=\"noreferrer\">Officiële Samsung-supportpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 240, "main"),
        programme("super-speed-39", "Super Speed 39′", "Super Speed 39′", 39, "main"),
        programme("quick-15", "15′ Quick Wash", "Kort programma 15′", 15, "main")
      ]
    },
    {
      id: "haier-hw80-bp14929a-s",
      brand: "Haier",
      model: "HW80-BP14929A-S",
      option: local("Haier HW80-BP14929A-S", "Haier HW80-BP14929A-S"),
      timer: local("End time delay", "Eindtijduitstel"),
      timerRange: { min: 0.5, max: 24, step: 0.5, mode: "end" },
      timerIncrements: local("30-minute increments", "stappen van 30 minuten"),
      prewashMinutes: 0,
      defaultProgram: "quick-15",
      groups: [group("main", "Documented programmes", "Gedocumenteerde programma’s")],
      manual: local("Haier HW80-BP14929A-S manual and product sheet", "Haier HW80-BP14929A-S-handleiding en productblad"),
      reference: local(
        "The manual documents 0.5–24 hour end-time delay in 30-minute increments. Eco is the full-load regulatory duration; actual programme estimates may change. <a class=\"source-link\" href=\"https://www.haier-europe.com/nl_NL/wasmachine/31020242/hw80-bp14929a-s/\" rel=\"noreferrer\">Official Haier product page</a>.",
        "De handleiding documenteert 0,5–24 uur eindtijduitstel in stappen van 30 minuten. Eco is de wettelijke duur bij volle belading; werkelijke programmaschattingen kunnen veranderen. <a class=\"source-link\" href=\"https://www.haier-europe.com/nl_NL/wasmachine/31020242/hw80-bp14929a-s/\" rel=\"noreferrer\">Officiële Haier-productpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 218, "main"),
        programme("quick-15", "Quick 15′", "Snel 15′", 15, "main")
      ]
    },
    {
      id: "inventum-vwm8010w-vwm8030b",
      brand: "Inventum",
      model: "VWM8010W / VWM8030B",
      option: local("Inventum VWM8010W / VWM8030B", "Inventum VWM8010W / VWM8030B"),
      timer: local("Delay Start", "Startuitstel"),
      timerRange: { min: 1, max: 24, step: 1, mode: "start" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "mix",
      groups: [group("wash", "Wash programmes", "Wasprogramma’s"), group("care", "Care programmes", "Onderhoudsprogramma’s")],
      manual: local("Inventum VWM8010W/VWM8030B manual · programme table", "Inventum VWM8010W/VWM8030B-handleiding · programmatabel"),
      reference: local(
        "The official manual shares this programme/control table across the two listed models and documents a 0–24 hour delayed start. Times can vary with conditions and options. <a class=\"source-link\" href=\"https://www.inventum.eu/files/Webdav/vwm8030b-01-gebruiksaanwijzing.pdf\" rel=\"noreferrer\">Official Inventum manual</a>.",
        "De officiële handleiding deelt deze programma-/bedieningstabel voor de twee genoemde modellen en documenteert 0–24 uur startuitstel. Tijden kunnen variëren door omstandigheden en opties. <a class=\"source-link\" href=\"https://www.inventum.eu/files/Webdav/vwm8030b-01-gebruiksaanwijzing.pdf\" rel=\"noreferrer\">Officiële Inventum-handleiding</a>."
      ),
      programs: [
        programme("cotton", "Cotton", "Katoen", 219, "wash"),
        programme("synthetics", "Synthetics", "Synthetisch", 198, "wash"),
        programme("mix", "Mix", "Mix", 80, "wash"),
        programme("bedding", "Bedding", "Beddengoed", 108, "wash"),
        programme("allergy", "Allergy", "Allergie", 121, "wash"),
        programme("20c", "20 °C", "20 °C", 61, "wash"),
        programme("quick-15", "Quick 15′", "Snel 15′", 15, "wash"),
        programme("sterile-70", "Sterile 70 °C", "Steriel 70 °C", 147, "wash"),
        programme("eco-40-60", "Eco 40–60", "Eco 40–60", 218, "wash"),
        programme("wool", "Wool", "Wol", 59, "wash"),
        programme("rinse-spin", "Rinse + spin", "Spoelen + centrifugeren", 20, "care"),
        programme("spin-drain", "Spin + drain", "Centrifugeren + afpompen", 12, "care"),
        programme("drum-clean", "Drum clean", "Trommelreiniging", 78, "care")
      ]
    },
    {
      id: "beko-bm3wft31041w",
      brand: "Beko",
      model: "BM3WFT31041W",
      option: local("Beko BM3WFT31041W", "Beko BM3WFT31041W"),
      timer: local("End time", "Eindtijd"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "xpress-30",
      groups: [group("main", "Documented programmes", "Gedocumenteerde programma’s")],
      manual: local("Beko BM3WFT31041W manual · programme table", "Beko BM3WFT31041W-handleiding · programmatabel"),
      reference: local(
        "Official table values are indicative baseline times and can change with load, options, water and ambient conditions. <a class=\"source-link\" href=\"https://www.beko.com/nl-nl/producten/vrijstaande-wasmachines/vrijstaande-wasmachine-10-kg-1400-rpm-bm3wft31041w\" rel=\"noreferrer\">Official Beko product page</a>.",
        "De officiële tabelwaarden zijn indicatieve basistijden en kunnen veranderen door belading, opties, water- en omgevingsomstandigheden. <a class=\"source-link\" href=\"https://www.beko.com/nl-nl/producten/vrijstaande-wasmachines/vrijstaande-wasmachine-10-kg-1400-rpm-bm3wft31041w\" rel=\"noreferrer\">Officiële Beko-productpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 228, "main"),
        programme("cotton-20", "Cotton 20 °C", "Katoen 20 °C", 220, "main"),
        programme("cotton-60", "Cotton 60 °C", "Katoen 60 °C", 220, "main"),
        programme("synthetics-40", "Synthetics 40 °C", "Synthetisch 40 °C", 140, "main"),
        programme("xpress-30", "Xpress 30 °C", "Xpress 30 °C", 28, "main"),
        programme("wool-40", "Delicates/Wool 40 °C", "Fijne was/Wol 40 °C", 60, "main"),
        programme("mixed-40", "Mixed 40 °C", "Gemengd 40 °C", 83, "main"),
        programme("duvet-60", "Duvet 60 °C", "Dons 60 °C", 100, "main"),
        programme("stainexpert-60", "StainExpert 60 °C", "StainExpert 60 °C", 86, "main"),
        programme("shirts-60", "Shirts 60 °C", "Overhemden 60 °C", 70, "main"),
        programme("hygiene-90", "Hygiene+ 90 °C", "Hygiene+ 90 °C", 125, "main"),
        programme("cold-wash", "Cold wash", "Koud wassen", 55, "main"),
        programme("drum-clean", "DrumClean", "Trommelreiniging", 80, "main")
      ]
    },
    {
      id: "bosch-wan2827dnl",
      brand: "Bosch",
      model: "WAN2827DNL",
      option: local("Bosch WAN2827DNL", "Bosch WAN2827DNL"),
      timer: local("Ready in", "Klaar in"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "super-quick-30",
      groups: [group("main", "Manufacturer-published durations", "Door fabrikant gepubliceerde tijden")],
      manual: local("Bosch WAN2827DNL product sheet and manual", "Bosch WAN2827DNL-productblad en handleiding"),
      reference: local(
        "Only manufacturer-published fixed/reference durations are included. Bosch load sensing can adjust other programmes; use the measured-time override when needed. <a class=\"source-link\" href=\"https://media3.bosch-home.com/Documents/specsheet/nl-NL/WAN2827DNL.pdf\" rel=\"noreferrer\">Official Bosch specification sheet</a>.",
        "Alleen door de fabrikant gepubliceerde vaste/referentietijden zijn opgenomen. Bosch-beladingsmeting kan andere programma’s aanpassen; gebruik waar nodig de gemeten-tijdcorrectie. <a class=\"source-link\" href=\"https://media3.bosch-home.com/Documents/specsheet/nl-NL/WAN2827DNL.pdf\" rel=\"noreferrer\">Officieel Bosch-specificatieblad</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 213, "main"),
        programme("super-quick-30", "Super quick 30′", "Extra snel 30′", 30, "main"),
        programme("super-quick-15", "Super quick 15′ (SpeedPerfect)", "Extra snel 15′ (SpeedPerfect)", 15, "main")
      ]
    },
    {
      id: "siemens-wg44j2a9nl",
      brand: "Siemens",
      model: "WG44J2A9NL",
      option: local("Siemens WG44J2A9NL", "Siemens WG44J2A9NL"),
      timer: local("Ready in", "Klaar in"),
      timerRange: { min: 1, max: 24, step: 1, mode: "end" },
      timerIncrements: local("whole-hour increments", "stappen van een heel uur"),
      prewashMinutes: 0,
      defaultProgram: "super-quick-30",
      groups: [group("main", "Manufacturer-published durations", "Door fabrikant gepubliceerde tijden")],
      manual: local("Siemens WG44J2A9NL product sheet and manual", "Siemens WG44J2A9NL-productblad en handleiding"),
      reference: local(
        "Only manufacturer-published fixed/reference durations are included. Sensor-controlled programmes can differ in practice; use the measured-time override when needed. <a class=\"source-link\" href=\"https://www.siemens-home.bsh-group.com/nl/nl/product/wassen-en-drogen/wasmachines/wasmachines-voorladers/WG44J2A9NL\" rel=\"noreferrer\">Official Siemens product page</a>.",
        "Alleen door de fabrikant gepubliceerde vaste/referentietijden zijn opgenomen. Sensorgestuurde programma’s kunnen in de praktijk afwijken; gebruik waar nodig de gemeten-tijdcorrectie. <a class=\"source-link\" href=\"https://www.siemens-home.bsh-group.com/nl/nl/product/wassen-en-drogen/wasmachines/wasmachines-voorladers/WG44J2A9NL\" rel=\"noreferrer\">Officiële Siemens-productpagina</a>."
      ),
      programs: [
        programme("eco-40-60", "Eco 40–60 (full load)", "Eco 40–60 (volle belading)", 217, "main"),
        programme("super-quick-30", "Extra quick 30′", "Extra snel 30′", 30, "main"),
        programme("super-quick-15", "Extra quick 15′ (varioSpeed)", "Extra snel 15′ (varioSpeed)", 15, "main")
      ]
    }
  ];
})();
