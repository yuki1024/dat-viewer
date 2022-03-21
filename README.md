# DAT Viewer
- DAT: Definition of Architecture Topology (JSON format)
- Implemented in Javascript (+HTML+CSS)
- Graph Tool: Cytoscape.js

## Usage (example)
- Just access to https://yuki1024.github.io/dat-viewer/
- Install "Web Server for Chrome" Extension to your Chrome Browser.
- Set up a private instant server, then select the directory includes index.html.

----------------
v9.1 2022/3

- Now DAT Viewer became public and set Github Pages

----------------
v9.0 2021/5

- Add NUMA node related things
- Coloring has three states now

----------------
v8.0 2021/4

- Add IPS (Instruction per second) related things
- Realtime graph refreshing by the change of json text field is obsolete. Instead of this, a new "Refresh" button is now available as a manual refreshing method. "ReCalc" button is integrated in the "Refresh" button.
- Add "comment" property
- Change default node shapes: round-rectangle -> rectangle, round-diamond -> diamond
- Minor changes

----------------
v7.1 2021/3

- Bugfix: selected_id_list

----------------
v7.0 2021/3

- Significantly improve the whole design (mainly revise CSS)
- Add an explanation section below a viewer section
- Import mutiple dat files are available
- Add a dat file manager which can deal multiple dat files
- Keep a current coloring state and toggle with a coloring button

----------------
v6.0 2021/3

- Add a ReCalc button: Re-calculate time with dat info
- Format numbers in a tooltip into a short length
- Fix coloring problems

----------------
v5.0 2021/3

- Display a tooltip when a node is mouse hovered

----------------
v4.0 2021/1

- Add FLOPS-related attributes in core_class and core_obj
- Implement coloring core nodes with FLOPs
- bandwidth_b, capacity_b attributes are now obsolete
- bandwidth attribute is now separated into read_bandwidth and write_bandwidth
- Bug fixes and minor changes

----------------
v3.0 2020/12

- Put all libraries on local
- Support handling multiple selected objects: can move, duplicate, remove, align
- Implement One-click add mode
- Add align function
- Add change font size function
- Set default colors, shapes, sizes
- Add L1, L2, L3 presets
- Implement coloring nodes with time (not edges)
- Bug fixes and minor changes

----------------
v2.0 2020/11

- Node has stat info (not edge)
- Bug fixes and minor changes

----------------
v1.0 2020/11

- There are all necessary bare minimum functions enough to work
- Implement coloring edges with time
- Edge has stats (e.g. bandwidth, time)

----------------




