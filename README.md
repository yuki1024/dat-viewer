# DAT Viewer
- DAT: Definition of Architecture Topology (JSON format)
- Implemented in Javascript (+HTML+CSS)
- Graph Tool: Cytoscape.js

## Usage
- Just access to https://yuki1024.github.io/dat-viewer/
- See description at the bottom of the page
- Download files in sample_dat dir, import them into DAT Viewer. See how it works
- For development: Install "Web Server for Chrome" Extension to your Chrome Browser. Set up a private instant server, then select the directory includes index.html.

----------------
v14.0 2022/6
- Change some colors
- numa_node = -1 means the obj is diable

----------------
v13.0 2022/6

- Edge duplex: half/full/simplex
- Change Edge shapes
- Some keys in Edge class/obj are changed into s2t and t2s
- NUMA node coloring mode now shows multiple colors in an obj when multiple numa_nodes are set in the obj
- Realtime graph refreshing (by the change of json text field) is now revived. This function had been adopeted before v7 or less versions until it became obsolete in v8. This might be still costly. If any problem occurs, it will become obsolete again in the future versions.
- Edge objs of default class can be made without selecting any edge class
- Add type and sub_id keys in Mem class to distinguish memory types
- Add some preset classes (include Scratchpad memory)
- Add slice key in Cache class
- Change some default coloring
- Minor changes

----------------
v12.0 2022/4

- Fix label names of preset classes
- Fix coloring at arrow heads on edges
- Tooltip (mouseover) is now available also on edge
- Add a caveat text about edge on Tips

----------------
v11.0 2022/4

- Change UI a lot
- Remove Add button
- Implement Class select box
- Implement Add a Class button
- Edge object has stats info
- Edge class has some info for stats also
- Edge becomes to aware direction and duplex
- Coloring edges
- Auto-scroll when a class is selected in selectbox or an obj is selected in cy
- Add some preset classes on each obj
- Revise default colors
- Bugfix in DAT file manager
- Minor changes

----------------
v10.0 2022/3

- Add duplex key in cache/mem/router obj
- Update Refresh (Recalc) function for duplex
- Minor changes

----------------
v9.1 2022/3

- Now DAT Viewer became public and set Github Pages
- Add sample dat files

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




