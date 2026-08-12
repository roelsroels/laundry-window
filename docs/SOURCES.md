# Appliance sources

Laundry Window is specifically configured for model **Samsung WF702Y4BKWQ/EN**, identified from the model label and confirmed on [Samsung's Dutch support page](https://www.samsung.com/nl/support/model.WF702Y4BKWQ_EN/).

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

No compatibility is currently claimed for other Samsung ranges or other brands. Future support should add a separately sourced machine profile rather than reusing these durations by similarity alone.

## Referenced sections

- Pages 24–25: Delay End is selectable from 3 to 19 hours in whole-hour increments. The displayed number is the number of hours until the programme finishes.
- Page 24: Quick wash can be set to 15, 20, 30, 40, 50, or 60 minutes.
- Page 37: baseline durations for all eleven dial programmes.
- Page 37: prewash adds approximately 18 minutes.

## Accuracy caveat

The manual says the listed durations were measured under IEC 60456 / EN 60456 conditions. Samsung warns that actual values can differ due to water pressure and temperature, load, and fabric type. The Intensive option extends every cycle, but the manual does not specify a fixed duration.

Laundry Window therefore centres a cycle within the selected cheap-energy window when possible and applies a 15-minute margin by default. Users can store a measured duration for each programme in their own browser. Those overrides never leave the device.

## Market-price source

The optional live suggestion uses [EnergyZero’s public price API](https://external.docs.api.staging.energyzero.nl/docs/api/rest/public/public-api/):

`https://public.api.energyzero.nl/public/v1/prices`

The request specifies electricity, a Dutch calendar date, and `INTERVAL_QUARTER`. No API key is required and the response permits browser CORS requests. Laundry Window reads only the `base` stream: raw market prices in `€/kWh` without VAT, purchasing fees, taxes, or other additions. It ignores the API’s `base_with_vat`, `all_in`, and `all_in_with_vat` streams.

[EnergyZero’s consumer price page](https://consumenten.energyzero.nl/actuele-tarieven) states that next-day electricity prices normally appear around 15:00 and confirms quarter-hour pricing. On 12 August 2026, its API already returned all 96 quarter-hours for 13 August while the previous Utilitarian feed still contained only 12 August; this discrepancy prompted the provider switch.

Laundry Window fetches the endpoint only after the user presses **Suggest today** or **Suggest tomorrow**. The request includes only the calendar date and fixed energy/interval parameters; no selected programme, measured duration, or other browser-stored setting is included. The optimiser compares immediate start and complete cycles permitted by the washing machine’s 3–19 hour Delay End choices, weighting every covered market interval by the amount of the cycle that overlaps it.

The result is a market-price signal, not a complete consumer tariff. Taxes, VAT, supplier markups, and other contract-specific components are excluded.
