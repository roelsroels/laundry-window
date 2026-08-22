# Appliance sources

Laundry Window uses separate, model-specific profiles. Durations and timer rules are never shared between unrelated machines.

## Samsung WF702Y4BKWQ/EN

The Samsung profile is configured for model **WF702Y4BKWQ/EN**, identified from the model label and confirmed on [Samsung's Dutch support page](https://www.samsung.com/nl/support/model.WF702Y4BKWQ_EN/).

The primary source is Samsung's official Dutch user manual:

- Document: `WF702Y4BK-03149B-02_XEN.pdf`
- Version shown by Samsung: 1.0
- Manual date: 26 March 2014
- [Download from Samsung](https://org.downloadcenter.samsung.com/downloadfile/ContentsFile.aspx?CDSite=UNI_NL&OriginYN=N&ModelType=N&ModelName=WF702Y4BKWQ%2FEN&CttFileID=4973101&CDCttType=UM&VPath=UM%2F201403%2F20140326155440984%2FWF702Y4BK-03149B-02_XEN.pdf)

## Compatibility scope

The cover of that manual explicitly lists these Samsung families:

- `WF702Y4BK**` and `WF702B4BK**`
- `WF700Y4BK**` and `WF700B4BK**`
- `WF602Y4BK**` and `WF602B4BK**`
- `WF600Y4BK**` and `WF600B4BK**`

The programme table uses shared duration values for these families, while separating only load capacity and maximum spin speed where applicable. Laundry Window therefore documents the shared-manual families as compatible with its timing data. Physical testing was performed only with `WF702Y4BKWQ/EN`; regional variants should still be checked against their supplied manual before relying on the result.

No compatibility is claimed for other Samsung ranges. Future support should add a separately sourced machine profile rather than reusing these durations by similarity alone.

## Referenced sections

- Pages 24–25: Delay End is selectable from 3 to 19 hours in whole-hour increments. The displayed number is the number of hours until the programme finishes.
- Page 24: Quick wash can be set to 15, 20, 30, 40, 50, or 60 minutes.
- Page 37: baseline durations for all eleven dial programmes.
- Page 37: prewash adds approximately 18 minutes.

## Accuracy caveat

The manual says the listed durations were measured under IEC 60456 / EN 60456 conditions. Samsung warns that actual values can differ due to water pressure and temperature, load, and fabric type. The Intensive option extends every cycle, but the manual does not specify a fixed duration.

Laundry Window therefore centres a cycle within the selected cheap-energy window when possible. The safety margin defaults to 0 minutes, with optional 10-, 15-, and 30-minute margins available under Fine-tune. Users can store a measured duration for each programme in their own browser. Those overrides never leave the device.

## Bosch WAE284A7NL/12 · Maxx 7 VarioPerfect

The Bosch profile was identified from the photographed label as **WAE284A7NL/12**, FD 9311. Bosch's [official product-service page](https://www.bosch-home.nl/nl/productservice/WAE284A7NL-12) confirms the exact E-number and identifies it as a Series 4, 7 kg, 1400 rpm front-loader. The same model is also identified as **Maxx 7 VarioPerfect** in parts catalogues.

Bosch's current service archive exposes the exact model's installation document and specification sheet, but not its operating/programme table. The programme source used here is the Bosch WAE284A7 Dutch user manual preserved by [Handleidi.ng](https://www.handleidi.ng/bosch/wae284a7/handleiding). Its control-panel page documents **Klaar in** as “Einde programma na …” with a 1–24 hour range; its programme/consumption table provides these durations:

| Programme setting | Load | Baseline |
| --- | ---: | ---: |
| Cotton 20 °C | 7 kg | 150 min |
| Cotton 30 °C | 7 kg | 150 min |
| Cotton 40 °C | 7 kg | 150 min |
| Cotton 60 °C | 7 kg | 165 min |
| Cotton 90 °C | 7 kg | 165 min |
| Easy-care 40 °C | 3 kg | 105 min |
| Quick/Mix 40 °C | 3 kg | 75 min |
| Delicates/Silk 30 °C | 2 kg | 45 min |
| Wool 30 °C | 2 kg | 45 min |
| Super quick 15′ | 2 kg | 15 min |

The Bosch manual also states that programme duration can change during the wash because the programme sequence is optimised for the load, imbalance, or foam. It does not publish one fixed duration for every other dial programme (for example Allergy+, Shirts, Sports, Duvet, Rinse/Spin, and Drain). Laundry Window deliberately omits invented durations for those choices. A user can select the closest documented setting and store the duration shown by their own machine, or a future profile update can add further measured values.

The Bosch timer calculation excludes any whole-hour finish time that would imply the cycle had to start before the time at which the machine is being set. This matters for long programmes: a 150-minute Cotton cycle cannot validly use a 1h or 2h Klaar in value even though the control's overall range begins at 1h. If no whole-hour value set at the current minute gives a complete fit, the calculator also checks later activation times. It can therefore instruct the user to return at an exact minute and then select a whole-hour **Klaar in** value, keeping the resulting cycle fully inside the requested window.

## Netherlands-first catalogue selection

The August 2026 expansion is an **NL priority catalogue**, not a statistical claim about audited Dutch or European unit sales. No stable, public model-level Europe-wide sales table was found, and exact models vary across national markets.

The starting snapshot was bol.com’s public [Top 10 best-selling washing machines](https://www.bol.com/nl/nl/t/top-10-best-verkochte-wasmachines/11064/) as observed on **13 August 2026**. It showed Hisense WF3S8043BW3/BLX, AEG LF628600, Samsung WW11DG5B25AB, Haier HW80-BP14929A-S, CHiQ, Inventum VWM8010W, Inventum VWM8030B, two Beko variants and Hisense WF5I1045BBQ. A retailer’s ranking is a useful demand signal but is neither a market-share census nor stable over time.

Exact official evidence remained the inclusion gate. Duplicate profiles and entries without an exact manufacturer programme/timer source were not padded into the app. Bosch WAN2827DNL and Siemens WG44J2A9NL were added from current Dutch test coverage instead. [Consumentenbond’s test-method page](https://www.consumentenbond.nl/wasmachine/hoe-wij-testen) says model selection considers expected sales while also covering major brands and common capacities. The result is ten maintainable profiles including the two existing machines.

## Hisense WF3S8043BW3/BLX

- [Official Dutch product page](https://nl.hisense.com/producten/wassen-en-drogen/wasmachines/WASHER-WF3S8043BW3-WF3S8043BW3-BLX-HSN/p/000000000020013444)
- [Official EPREL product information sheet](https://eprel.ec.europa.eu/informationsheet/Fiche_1858697_EN.pdf)
- Timer: end-time delay, one-hour selections up to 24 hours. Values that would imply a start before setup are rejected.
- Published reference values used: Eco 40–60 full load 218 min, Cotton 20 °C 138 min, Cotton 60 °C 218 min, Synthetics 40 °C 153 min, Quick 15′ and Power Wash 49′.

Programme temperature and options can change the displayed duration. Quick 15′ is the default short-cycle reference; a hotter quick selection can run longer.

## AEG LF628600

- [Official Dutch product page](https://www.aeg.nl/laundry/laundry/washing-machines/front-loader-washing-machine/lf628600/)
- [Official Dutch user manual](https://www.aeg.nl/services/eml/asset/b5d55261-fc3b-4061-9415-904166498cad/E4RM3Q/251001VWVR/PDF/251001VWVR.pdf)
- Manual page 15: **Startuitstel** delays the start. Selectable values are 30, 60 and 90 minutes, then whole hours from 2 through 20.
- Manual pages 36–37: Eco 40–60 full load 205 min; indicative common-programme references Cotton 95 °C 245 min, Cotton 60 °C 230 min, Cotton 20 °C 170 min, Synthetics 40 °C 135 min, Delicates 30 °C 75 min and Wool/Silk 30 °C 65 min.
- The named 20 min. – 3 kg programme supplies its fixed 20-minute reference.

The manual explicitly says common-programme values are indicative and that duration changes with conditions, settings and ProSense load detection.

## Samsung WW11DG5B25AB

- [Official Dutch product page](https://www.samsung.com/nl/washers-and-dryers/washing-machines/ww5000d-front-loading-smartthings-ai-energy-mode-a-10-percent-extra-energy-efficiency-ai-ecobubble-11kg-black-ww11dg5b25aben/)
- [Official Dutch support page](https://www.samsung.com/nl/support/model/WW1UDG5B25ABEN/)
- [Official user manual](https://org.downloadcenter.samsung.com/downloadfile/ContentsFile.aspx?CDCttType=UM&CDSite=UNI_NL&CttFileID=11285052&ModelName=WW11DG5B25AB&ModelType=N&OriginYN=N&VPath=UM%2F202602%2F20260211172744763%2FOID72364_IB_WW5000C-MD_NL_260206.pdf)
- Timer: Delay End, 1–24 hours in one-hour increments.
- Product/reference values: Eco 40–60 full load 240 min, Super Speed standard 5 kg cycle 39 min and 15′ Quick Wash.

## Haier HW80-BP14929A-S

- [Official Dutch product page](https://www.haier-europe.com/nl_NL/wasmachine/31020242/hw80-bp14929a-s/)
- [Official manufacturer manual](https://d15v10x8t3bz3x.cloudfront.net/Libretti/2024/12/17343684/MAN-000189297_000)
- Timer: end-time delay from 0.5 through 24 hours in 30-minute increments.
- Reference values: Eco 40–60 full load 218 min and Quick 15′.

## Inventum VWM8010W / VWM8030B

- [Official VWM8010W product page](https://www.inventum.eu/vrijstaande-apparaten/wassen-en-drogen/vwm8010w/)
- [Official VWM8030B product page](https://www.inventum.eu/vrijstaande-apparaten/wassen-en-drogen/vwm8030b/)
- [Official shared programme/control manual](https://www.inventum.eu/files/Webdav/vwm8030b-01-gebruiksaanwijzing.pdf)
- Timer: Startuitstel delays the start, 0–24 hours in one-hour increments. The planner presents 1–24 plus immediate Start now.
- Manual table values: Cotton 219, Synthetics 198, Mix 80, Bedding 108, Allergy 121, 20 °C 61, Quick 15, Sterile 70 °C 147, Eco 40–60 218, Wool 59, Rinse + Spin 20, Spin + Drain 12 and Drum Clean 78 minutes.

The manual/control table identifies both listed models; this is the only new combined profile. No wider Inventum-family compatibility is inferred.

## Beko BM3WFT31041W

- [Official Dutch product page](https://www.beko.com/nl-nl/producten/vrijstaande-wasmachines/vrijstaande-wasmachine-10-kg-1400-rpm-bm3wft31041w)
- [Official Dutch user manual](https://www.beko.com/content/dam/netherlands-nl-aem/netherlands-nl-aemProductCatalog/product-documents/457100006600-BM3WFT31041W/nl-NL-457100006600-202408270918163-User-Manual---File-Longnl-NL.pdf)
- Timer: programme end time up to 24 hours in one-hour increments.
- Manual table values used: Eco 40–60 full load 228, Cotton 20/60 °C 220, Synthetics 40 °C 140, Xpress 30 °C 28, Delicates/Wool 40 °C 60, Mixed 40 °C 83, Duvet 60 °C 100, StainExpert 60 °C 86, Shirts 60 °C 70, Hygiene+ 90 °C 125, Cold wash 55 and DrumClean 80 minutes.

The bol snapshot contained nearby Beko regional variants. Laundry Window claims support only for the exact `BM3WFT31041W` whose official Dutch table was verified.

## Bosch WAN2827DNL

- [Official Dutch specification sheet](https://media3.bosch-home.com/Documents/specsheet/nl-NL/WAN2827DNL.pdf)
- Timer: Klaar in / Ready in, 1–24 hours in one-hour increments.
- Reference values: Eco 40–60 full load 213 min and the documented Super Quick 15/30 options.

Only these published fixed/reference choices are included. Sensor-adjusted programmes should use the locally stored measured-time override.

## Siemens WG44J2A9NL

- [Official Dutch product page](https://www.siemens-home.bsh-group.com/nl/nl/product/wassen-en-drogen/wasmachines/wasmachines-voorladers/WG44J2A9NL)
- [Official Dutch user manual](https://media3.bsh-group.com/Documents/9002045621_A.pdf)
- [Official Dutch specification sheet](https://media3.bsh-group.com/Documents/specsheet/nl-NL/WG44J2A9NL.pdf)
- Timer: Klaar in / Ready in, 1–24 hours in one-hour increments.
- Reference values: Eco 40–60 full load 217 min, Extra Snel 30′ and Extra Snel 15′ with varioSpeed.

As with Bosch, adaptive programmes without one published reference duration are deliberately omitted.

## Market-price source

The optional live suggestion uses [EnergyZero’s public price API](https://external.docs.api.staging.energyzero.nl/docs/api/rest/public/public-api/):

`https://public.api.energyzero.nl/public/v1/prices`

The request specifies electricity, a Dutch calendar date, and `INTERVAL_QUARTER`. No API key is required and the response permits browser CORS requests. Laundry Window reads only the `base` stream: raw market prices in `€/kWh` without VAT, purchasing fees, taxes, or other additions. It ignores the API’s `base_with_vat`, `all_in`, and `all_in_with_vat` streams.

[EnergyZero’s consumer price page](https://consumenten.energyzero.nl/actuele-tarieven) states that next-day electricity prices normally appear around 15:00 and confirms quarter-hour pricing. On 12 August 2026, its API already returned all 96 quarter-hours for 13 August while the previous Utilitarian feed still contained only 12 August; this discrepancy prompted the provider switch.

Laundry Window fetches the endpoint only after the user presses **Suggest today** or **Suggest tomorrow**. The request includes only the calendar date and fixed energy/interval parameters; no selected machine, programme, measured duration, or other browser-stored setting is included. The optimiser compares immediate start and complete cycles permitted by the selected machine’s timer choices and semantics. It also evaluates minute-aligned future activation times when waiting before setting the same timer can create a complete fit. Across both sets, the earliest fully fitting wash start wins; waiting is therefore recommended when it can align a fixed timer step more closely with the beginning of the low-price band. The weighted wholesale average breaks ties only after wash start, followed by the earliest activation time. This rule is timer-mode agnostic and applies to both start-delay and finish-delay profiles. Every covered market interval is weighted by the amount of the cycle that overlaps it. A selectable cycle that fits completely inside the displayed low-price band and safety margin always ranks above a cheaper cycle that extends outside it. When no complete fit exists, maximum overlap ranks first, followed by earliest start and average price.

The result is a market-price signal, not a complete consumer tariff. Taxes, VAT, supplier markups, and other contract-specific components are excluded.
