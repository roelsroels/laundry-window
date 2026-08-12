# Appliance sources

Laundry Window uses separate, model-specific profiles. Durations and finish-timer rules are never shared between unrelated machines.

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

Laundry Window therefore centres a cycle within the selected cheap-energy window when possible and applies a 15-minute margin by default. Users can store a measured duration for each programme in their own browser. Those overrides never leave the device.

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

The Bosch timer calculation excludes any whole-hour finish time that would imply the cycle had to start before the time at which the machine is being set. This matters for long programmes: a 150-minute Cotton cycle cannot validly use a 1h or 2h Klaar in value even though the control's overall range begins at 1h.

## Market-price source

The optional live suggestion uses [EnergyZero’s public price API](https://external.docs.api.staging.energyzero.nl/docs/api/rest/public/public-api/):

`https://public.api.energyzero.nl/public/v1/prices`

The request specifies electricity, a Dutch calendar date, and `INTERVAL_QUARTER`. No API key is required and the response permits browser CORS requests. Laundry Window reads only the `base` stream: raw market prices in `€/kWh` without VAT, purchasing fees, taxes, or other additions. It ignores the API’s `base_with_vat`, `all_in`, and `all_in_with_vat` streams.

[EnergyZero’s consumer price page](https://consumenten.energyzero.nl/actuele-tarieven) states that next-day electricity prices normally appear around 15:00 and confirms quarter-hour pricing. On 12 August 2026, its API already returned all 96 quarter-hours for 13 August while the previous Utilitarian feed still contained only 12 August; this discrepancy prompted the provider switch.

Laundry Window fetches the endpoint only after the user presses **Suggest today** or **Suggest tomorrow**. The request includes only the calendar date and fixed energy/interval parameters; no selected machine, programme, measured duration, or other browser-stored setting is included. The optimiser compares immediate start and complete cycles permitted by the selected machine’s finish-timer range, weighting every covered market interval by the amount of the cycle that overlaps it. A selectable cycle that fits completely inside the displayed low-price band and safety margin always ranks above a cheaper cycle that extends outside it. When no complete fit exists, maximum overlap ranks first and average price breaks ties.

The result is a market-price signal, not a complete consumer tariff. Taxes, VAT, supplier markups, and other contract-specific components are excluded.
