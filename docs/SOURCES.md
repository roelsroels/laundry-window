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
