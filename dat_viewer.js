
function main(){

	//----------------------------------------------------------------
	//Cytoscape setting

	let elements = { nodes: [], edges: [] };
	let style = [];
	let layout = {name: 'preset'};

	var cy = cytoscape({
		container: document.getElementById('cy'),
		elements: elements,
		style: style,
		layout: layout,
		wheelSensitivity: 0.1,
	});

	//var eh = cy.edgehandles({snap: true, noEdgeEventsInDraw: true});
	var eh = cy.edgehandles({snap: true});

	//----------------------------------------------------------------
	//Init dat

	var dat = {
		'core_class': {
			'default': {
				'name': 'default',
				'dp_flops': '2.0 GFLOPS',
				'sp_flops': '1.0 GFLOPS',
				'ips': '1.0 GIPS',
				'color': '#FF5662',
				'shape': 'rectangle',
				'width': '30',
				'height': '30',
				"comment": '',
			},
		},
		'cache_class': {
			'L1': {
				'name': 'L1',
				'capacity': '32 KiB',
				'associativity': 8,
				'linesize': 64,
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'full',
				'color': '#FA9358',
				'shape': 'rectangle',
				'width': '40',
				'height': '40',
			},
			'L2': {
				'name': 'L2',
				'capacity': '32 KiB',
				'associativity': 8,
				'linesize': 64,
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'full',
				'color': '#FFDB61',
				'shape': 'rectangle',
				'width': '50',
				'height': '50',
			},
			'L3': {
				'name': 'L3',
				'capacity': '32 KiB',
				'associativity': 8,
				'linesize': 64,
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'full',
				'color': '#66F081',
				'shape': 'rectangle',
				'width': '60',
				'height': '60',
			},
			'default': {
				'name': 'default',
				'capacity': '32 KiB',
				'associativity': 8,
				'linesize': 64,
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'full',
				'color': '#FA9358',
				'shape': 'rectangle',
				'width': '40',
				'height': '40',
			},
		},
		'mem_class': {
			'default': {
				'name': 'default',
				'capacity': '1 GiB',
				'linesize': 64,
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'half',
				'color': '#60BCFF',
				'shape': 'rectangle',
				'width': '70',
				'height': '70',
			},
		},
		'router_class': {
			'default': {
				'name': 'default',
				'read_bandwidth': '100.0 GB/s',
				'write_bandwidth': '100.0 GB/s',
				'duplex': 'half',
				'color': '#8995FF',
				'shape': 'diamond',
				'width': '20',
				'height': '20',
			},
		},
		'edge_class': {
			'default': {
				'name': 'default',
				'color': '',
				'width': '',
			},
		},
		'core_obj': {
			/*
			//sample
			'uuid': {
				'name': 'Core-1',
				'class': 'default',
				'position': {
					'x': 0,
					'y': 0
				},
				'numa_node': 0,
				'num_dp_flops': 0,
				'num_sp_flops': 0,
				'num_inst': 0,
				'time_flops': 0,
				'time_inst': 0,
				'time': 0,
			},
			*/
		},
		'cache_obj': {
			/*
			//sample
			'uuid': {
				'name': 'Cache-1',
				'class': 'default',
				'position': {
					'x': 0,
					'y': 0
				},
				'numa_node': 0,
				'num_read': 0,
				'num_write': 0,
				'bytes_read': 0,
				'bytes_write': 0,
				'time': 0,
			},
			*/
		},
		'mem_obj': {
			/*
			//sample
			'uuid': {
				'name': 'Mem-1',
				'class': 'default',
				'position': {
					'x': 0,
					'y': 0
				},
				'numa_node': 0,
				'num_read': 0,
				'num_write': 0,
				'bytes_read': 0,
				'bytes_write': 0,
				'time': 0,
			},
			*/
		},
		'router_obj': {
			/*
			//sample
			'uuid': {
				'name': 'Router-1',
				'class': 'default',
				'position': {
					'x': 0,
					'y': 0
				},
				'numa_node': 0,
				'num_read': 0,
				'num_write': 0,
				'bytes_read': 0,
				'bytes_write': 0,
				'time': 0,
			},
			*/
		},
		'edge_obj': {
			/*
			//sample
			'uuid': {
				'name': 'Edge-1',
				'class': 'default',
				'source': 'node_id',
				'target': 'node_id',
			},
			*/
		},
	};

	var empty_dat = _.cloneDeep(dat); //deep copy

	var dat_list = {};
	add_a_dat('machine.dat', dat);

	refresh_textarea();
	refresh_cy_via_dat();

	//----------------------------------------------------------------
	//refresh cy via dat

	var node_font_size = 16;

	function refresh_cy_via_dat(){
		//clean up all
		cy.elements().remove();
		cy.style().resetToDefault().update();

		//define essentials
		let elements = { nodes: [], edges: [] };

		let style = [
			{ selector: 'node[name]',
				style: {'content': 'data(name)', 'font-size': node_font_size} },
			{ selector: 'edge',
				style: {'curve-style': 'bezier', 'line-color': '#A4A4A4'} },
			//#A4A4A4 or #D8D8D8
			//{ selector: ':selected',
			//	style: {'background-color': 'red', 'line-color': 'red'} },

			//edgehandles
			{ selector: '.eh-handle',
				style: {
					'background-color': 'red',
					'width': 12,
					'height': 12,
					'shape': 'ellipse',
					'overlay-opacity': 0,
					'border-width': 12, // makes the handle easier to hit
					'border-opacity': 0
				}
			},
			{ selector: '.eh-hover', style: {'background-color': 'red'} },
			{ selector: '.eh-source', style: {'border-width': 2, 'border-color': 'red'} },
			{ selector: '.eh-target', style: {'border-width': 2, 'border-color': 'red'} },
			{ selector: '.eh-preview, .eh-ghost-edge',
				style: {
					'background-color': 'red',
					'line-color': 'red',
					'target-arrow-color': 'red',
					'source-arrow-color': 'red'
				}
			},
			{ selector: '.eh-ghost-edge.eh-preview-active', style: {'opacity': 0} },
		];

		//reconstruct all
		for (const [key, val] of Object.entries(dat.core_obj)){
			let obj = {};
			obj.data = {};
			obj.data.id = key;
			obj.data.name = val.name;
			obj.data.class = val.class;
			obj.position = {};
			obj.position.x = val.position.x;
			obj.position.y = val.position.y;
			elements.nodes.push(obj);

			let obj_style = {};
			obj_style.selector = '#'+key;
			obj_style.style = {};
			if(dat.core_class[val.class].color) {
				obj_style.style['background-color'] = dat.core_class[val.class].color;
			}
			if(dat.core_class[val.class].shape) {
				obj_style.style['shape'] = dat.core_class[val.class].shape;
			}
			if(dat.core_class[val.class].width) {
				obj_style.style['width'] = dat.core_class[val.class].width;
			}
			if(dat.core_class[val.class].height) {
				obj_style.style['height'] = dat.core_class[val.class].height;
			}
			style.push(obj_style);
		};

		for (const [key, val] of Object.entries(dat.cache_obj)){
			let obj = {};
			obj.data = {};
			obj.data.id = key;
			obj.data.name = val.name;
			obj.data.class = val.class;
			obj.position = {};
			obj.position.x = val.position.x;
			obj.position.y = val.position.y;
			elements.nodes.push(obj);

			let obj_style = {};
			obj_style.selector = '#'+key;
			obj_style.style = {};
			if(dat.cache_class[val.class].color) {
				obj_style.style['background-color'] = dat.cache_class[val.class].color;
			}
			if(dat.cache_class[val.class].shape) {
				obj_style.style['shape'] = dat.cache_class[val.class].shape;
			}
			if(dat.cache_class[val.class].width) {
				obj_style.style['width'] = dat.cache_class[val.class].width;
			}
			if(dat.cache_class[val.class].height) {
				obj_style.style['height'] = dat.cache_class[val.class].height;
			}
			style.push(obj_style);
		};

		for (const [key, val] of Object.entries(dat.mem_obj)){
			let obj = {};
			obj.data = {};
			obj.data.id = key;
			obj.data.name = val.name;
			obj.data.class = val.class;
			obj.position = {};
			obj.position.x = val.position.x;
			obj.position.y = val.position.y;
			elements.nodes.push(obj);

			let obj_style = {};
			obj_style.selector = '#'+key;
			obj_style.style = {};
			if(dat.mem_class[val.class].color) {
				obj_style.style['background-color'] = dat.mem_class[val.class].color;
			}
			if(dat.mem_class[val.class].shape) {
				obj_style.style['shape'] = dat.mem_class[val.class].shape;
			}
			if(dat.mem_class[val.class].width) {
				obj_style.style['width'] = dat.mem_class[val.class].width;
			}
			if(dat.mem_class[val.class].height) {
				obj_style.style['height'] = dat.mem_class[val.class].height;
			}
			style.push(obj_style);
		};

		for (const [key, val] of Object.entries(dat.router_obj)){
			let obj = {};
			obj.data = {};
			obj.data.id = key;
			obj.data.name = val.name;
			obj.data.class = val.class;
			obj.position = {};
			obj.position.x = val.position.x;
			obj.position.y = val.position.y;
			elements.nodes.push(obj);

			let obj_style = {};
			obj_style.selector = '#'+key;
			obj_style.style = {};
			if(dat.router_class[val.class].color) {
				obj_style.style['background-color'] = dat.router_class[val.class].color;
			}
			if(dat.router_class[val.class].shape) {
				obj_style.style['shape'] = dat.router_class[val.class].shape;
			}
			if(dat.router_class[val.class].width) {
				obj_style.style['width'] = dat.router_class[val.class].width;
			}
			if(dat.router_class[val.class].height) {
				obj_style.style['height'] = dat.router_class[val.class].height;
			}
			style.push(obj_style);
		};

		for (const [key, val] of Object.entries(dat.edge_obj)){
			let obj = {};
			obj.data = {};
			obj.data.id = key;
			obj.data.name = val.name;
			obj.data.class = val.class;
			obj.data.source = val.source;
			obj.data.target = val.target;
			elements.edges.push(obj);

			let obj_style = {};
			obj_style.selector = '#'+key;
			obj_style.style = {};
			if(dat.edge_class[val.class].color) {
				obj_style.style['line-color'] = dat.edge_class[val.class].color;
			}
			if(dat.edge_class[val.class].width) {
				obj_style.style['width'] = dat.edge_class[val.class].width;
			}
			style.push(obj_style);
		};

		//complete
		cy.add(elements);
		cy.style(style);
		document.getElementById('dat_textarea').classList.remove('dat_textarea_error');

		//coloring
		coloring();

		//unselect all
		selected_id_list = [];
	}

	//----------------------------------------------------------------
	//refresh dat via cy

	//only when: moving a node, making a edge

	//when an element is freed (i.e. let go from being grabbed)
	//e.target == node
	cy.on('free', 'node', e => {
		//console.log(e.target.data('id'));
		//console.log(e.target.position('x'));
		let id = e.target.data('id');
		let node_type = find_node_type_include_id(id);
		//console.log(node_type);
		dat[node_type][id].position.x = e.target.position('x');
		dat[node_type][id].position.y = e.target.position('y');
		refresh_textarea();
	});

	//when the edge is created
	//(event, sourceNode, targetNode, addedEles)
	cy.on('ehcomplete', (e,s,t,a) => {
		/*
		console.log(s.data('id'));
		console.log(t.data('id'));
		console.log(a.data('source'));
		console.log(a.data('target'));
		console.log(a.data('id'));
		*/
		dat.edge_obj[a.data('id')] = generate_default_edge_obj();
		dat.edge_obj[a.data('id')].source = s.data('id');
		dat.edge_obj[a.data('id')].target = t.data('id');
		refresh_textarea();
	});

	//----------------------------------------------------------------
	//When a node is selected

	var selected_id_list = [];

	cy.on('select', e => {
		//console.log(e.target.data('id'));
		//console.log(e.target.position('x'));
		selected_id_list.push(e.target.data('id'));
		e.target.style({'background-color': 'red', 'line-color': 'red'});
	});

	cy.on('unselect', e => {
		//console.log(e.target.data('id'));
		//console.log(e.target.position('x'));
		selected_id_list = selected_id_list.filter(a => {return a !== e.target.data('id');});
		e.target.style({'background-color': '', 'line-color': ''});
	});

	//----------------------------------------------------------------
	//One-click generating a node

	cy.on('tap', e => {
		if (!one_click_mode) return;

		let id = uuidv4();

		switch(selected_node_type){
			case 'core':
				dat.core_obj[id] = generate_default_core_obj();
				dat.core_obj[id].position.x = e.position.x;
				dat.core_obj[id].position.y = e.position.y;
				break;
			case 'cache':
				dat.cache_obj[id] = generate_default_cache_obj(0);
				dat.cache_obj[id].position.x = e.position.x;
				dat.cache_obj[id].position.y = e.position.y;
				break;
			case 'l1':
				dat.cache_obj[id] = generate_default_cache_obj(1);
				dat.cache_obj[id].class = 'L1';
				dat.cache_obj[id].position.x = e.position.x;
				dat.cache_obj[id].position.y = e.position.y;
				break;
			case 'l2':
				dat.cache_obj[id] = generate_default_cache_obj(2);
				dat.cache_obj[id].class = 'L2';
				dat.cache_obj[id].position.x = e.position.x;
				dat.cache_obj[id].position.y = e.position.y;
				break;
			case 'l3':
				dat.cache_obj[id] = generate_default_cache_obj(3);
				dat.cache_obj[id].class = 'L3';
				dat.cache_obj[id].position.x = e.position.x;
				dat.cache_obj[id].position.y = e.position.y;
				break;
			case 'mem':
				dat.mem_obj[id] = generate_default_mem_obj();
				dat.mem_obj[id].position.x = e.position.x;
				dat.mem_obj[id].position.y = e.position.y;
				break;
			case 'router':
				dat.router_obj[id] = generate_default_router_obj();
				dat.router_obj[id].position.x = e.position.x;
				dat.router_obj[id].position.y = e.position.y;
				break;
		}

		refresh_textarea();
		refresh_cy_via_dat();
	});

	//----------------------------------------------------------------
	//Buttons

	var one_click_mode = true;

	document.getElementById('one_click_mode').addEventListener('change', e => {
		one_click_mode = e.target.checked;
	});

	var selected_node_type = 'core';

	document.getElementById('select_node_type').addEventListener('change', e => {
		selected_node_type = e.target.value;
	});

	document.getElementById('add_node_button').addEventListener('click', e => {
		let id = uuidv4();

		switch(selected_node_type){
			case 'core': dat.core_obj[id] = generate_default_core_obj(); break;
			case 'cache': dat.cache_obj[id] = generate_default_cache_obj(0); break;
			case 'l1':
				dat.cache_obj[id] = generate_default_cache_obj(1);
				dat.cache_obj[id].class = 'L1';
				break;
			case 'l2':
				dat.cache_obj[id] = generate_default_cache_obj(2);
				dat.cache_obj[id].class = 'L2';
				break;
			case 'l3':
				dat.cache_obj[id] = generate_default_cache_obj(3);
				dat.cache_obj[id].class = 'L3';
				break;
			case 'mem': dat.mem_obj[id] = generate_default_mem_obj(); break;
			case 'router': dat.router_obj[id] = generate_default_router_obj(); break;
		}

		refresh_textarea();
		refresh_cy_via_dat();
	});


	document.getElementById('duplicate_node_button').addEventListener('click', e => {
		let new_id_list = [];
		let old_and_new_dict = {};

		//Everything but except edges
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type === 'edge_obj') { continue; }

			let id = uuidv4();
			new_id_list.push(id);
			old_and_new_dict[selected_id] = id;

			switch(node_type){
				case 'core_obj':
					dat.core_obj[id] = generate_default_core_obj();
					dat.core_obj[id].class = dat.core_obj[selected_id].class;
					dat.core_obj[id].position.x = dat.core_obj[selected_id].position.x + 50;
					dat.core_obj[id].position.y = dat.core_obj[selected_id].position.y + 50;
					break;
				case 'cache_obj':
					let cache_type_num;
					switch(dat.cache_obj[selected_id].class){
						case 'L1':
							cache_type_num = 1;
							break;
						case 'L2':
							cache_type_num = 2;
							break;
						case 'L3':
							cache_type_num = 3;
							break;
						default:
							cache_type_num = 0;
							break;
					}
					dat.cache_obj[id] = generate_default_cache_obj(cache_type_num);
					dat.cache_obj[id].class = dat.cache_obj[selected_id].class;
					dat.cache_obj[id].position.x = dat.cache_obj[selected_id].position.x + 50;
					dat.cache_obj[id].position.y = dat.cache_obj[selected_id].position.y + 50;
					break;
				case 'mem_obj':
					dat.mem_obj[id] = generate_default_mem_obj();
					dat.mem_obj[id].class = dat.mem_obj[selected_id].class;
					dat.mem_obj[id].position.x = dat.mem_obj[selected_id].position.x + 50;
					dat.mem_obj[id].position.y = dat.mem_obj[selected_id].position.y + 50;
					break;
				case 'router_obj':
					dat.router_obj[id] = generate_default_router_obj();
					dat.router_obj[id].class = dat.router_obj[selected_id].class;
					dat.router_obj[id].position.x = dat.router_obj[selected_id].position.x + 50;
					dat.router_obj[id].position.y = dat.router_obj[selected_id].position.y + 50;
					break;
			}
		}

		//edges
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type !== 'edge_obj') { continue; }

			//When both source/target of the selected edge are also selected, the edge can be duplicated
			if((selected_id_list.includes(dat.edge_obj[selected_id].source)) && (selected_id_list.includes(dat.edge_obj[selected_id].target))) {
				let id = uuidv4();
				new_id_list.push(id);
				dat.edge_obj[id] = generate_default_edge_obj();
				dat.edge_obj[id].class = dat.edge_obj[selected_id].class;
				dat.edge_obj[id].source = old_and_new_dict[dat.edge_obj[selected_id].source];
				dat.edge_obj[id].target = old_and_new_dict[dat.edge_obj[selected_id].target];
			}
		}

		for(let selected_id of selected_id_list){
			cy.elements().filter(a => { return a.data('id') === selected_id; }).unselect();
		}

		refresh_textarea();
		refresh_cy_via_dat();

		for(let new_id of new_id_list){
			cy.elements().filter(a => { return a.data('id') === new_id; }).select();
		}

	});


	document.getElementById('remove_ele_button').addEventListener('click', e => {
		//First, delete edges
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type !== 'edge_obj') { continue; }
			delete dat.edge_obj[selected_id];
			selected_id_list = selected_id_list.filter(a => {return a !== selected_id;});
		}

		//Second, delete nodes which don't have any edges
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type === 'edge_obj') { continue; }

			let connected_edge_list = [];
			for(const [key,val] of Object.entries(dat.edge_obj)){
				if((val.source === selected_id) || (val.target === selected_id)){
					connected_edge_list.push(key);
				}
			}

			//delete connected edges
			for(let connected_edge of connected_edge_list){
				delete dat.edge_obj[connected_edge];
				selected_id_list = selected_id_list.filter(a => {return a !== connected_edge;});
			}

			//delete nodes
			switch(node_type){
				case 'core_obj': delete dat.core_obj[selected_id]; break;
				case 'cache_obj': delete dat.cache_obj[selected_id]; break;
				case 'mem_obj': delete dat.mem_obj[selected_id]; break;
				case 'router_obj': delete dat.router_obj[selected_id]; break;
				case 'edge_obj': delete dat.edge_obj[selected_id]; break;
			}
			selected_id_list = selected_id_list.filter(a => {return a !== selected_id;});
		}

		refresh_textarea();
		refresh_cy_via_dat();
	});


	document.getElementById('export_dat_button').addEventListener('click', e => {
		const input_text = document.getElementById('dat_textarea').value;
		const blob = new Blob([input_text], {type: 'text/plain'});
		const a = document.createElement('a');
		a.href =  URL.createObjectURL(blob);
		a.download = dat_list[current_selected_dat_id].name;
		a.click();
	});

	document.getElementById('import_dat_button').addEventListener('change', e => {
		//console.log(e.target.files);
		let files = e.target.files;
		for (let i=0; i<files.length; i++){
			let reader = new FileReader();
			reader.readAsText(files[i]);
			reader.onload = function(e){ //proceed asynchronously
				document.getElementById('dat_textarea').value = reader.result;
				let temp_dat = JSON.parse(reader.result);
				add_a_dat(files[i].name, temp_dat);
			}
		}
	});

	document.getElementById('font_plus_button').addEventListener('click', e => {
		node_font_size = parseInt(cy.nodes().style("font-size").replace('px',''), 10) + 1;
		cy.nodes().style({"font-size": node_font_size});
	});

	document.getElementById('font_minus_button').addEventListener('click', e => {
		let temp_num = parseInt(cy.nodes().style("font-size").replace('px',''), 10) - 1;
		if(temp_num < 0){
			node_font_size = 0;
		} else {
			node_font_size = temp_num;
		}
		cy.nodes().style({"font-size": node_font_size});
	});

	document.getElementById('align_button').addEventListener('click', e => {
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type === 'edge_obj') { continue; }
			let a_num = 50;
			dat[node_type][selected_id].position.x = Math.round(dat[node_type][selected_id].position.x/a_num)*a_num;
			dat[node_type][selected_id].position.y = Math.round(dat[node_type][selected_id].position.y/a_num)*a_num;
		}
		selected_id_list.splice(0);
		refresh_textarea();
		refresh_cy_via_dat();
	});

	var coloring_flag = 0;
	//0: normal(user defined color), 1: numa node, 2: colored by result
	//To the top

	document.getElementById('coloring_button').addEventListener('click', e => {
		//toggle
		coloring_flag++;
		coloring_flag = coloring_flag%3
		refresh_cy_via_dat(); //includes coloring()
	});

	function coloring(){
		//if(coloring_flag === undefined) { return; }
		switch(coloring_flag){
			case 0: break;
			case 1: coloring_with_numa_node(); break;
			case 2: coloring_with_result(); break;
			default: break;
		}
	}

	var numa_node_color_list = ['#81BEF7', '#F7819F', '#9FF781', '#F7BE81', '#A9A9F5', '#E2A9F3', '#81F7D8', '#F5DA81'];

	function coloring_with_numa_node(){
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				let color_temp;
				if(!val.numa_node){
					color_temp = numa_node_color_list[0];
				} else {
					color_temp = numa_node_color_list[val.numa_node%8];
				}
				let edge_style = {};
				edge_style['background-color'] = color_temp;
				cy.style().selector('#'+key).style(edge_style).update();
			}
		});
	}

	function coloring_with_result(){
		let max_time = 0;
		let min_time = Number.MAX_VALUE;

		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				if(max_time < val.time){
					max_time = val.time;
				}
				if((min_time > val.time) && (val.time > 0)){
					min_time = val.time;
				}
			}
		});
		if (min_time === Number.MAX_VALUE) { min_time = 0; }

		for (const [key, val] of Object.entries(dat.core_obj)){
			cy.style().selector('#'+key).style({'background-color': '#A4A4A4'}).update();
		}

		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				let color_temp;
				if(val.time > 0){
					color_temp = gen_color(val.time, min_time, max_time);
				} else {
					color_temp = '#A4A4A4';
				}
				let edge_style = {};
				edge_style['background-color'] = color_temp;
				cy.style().selector('#'+key).style(edge_style).update();
			}
		});

		/*
		//edge color
		for (const [key, val] of Object.entries(dat.edge_obj)){
			let edge_style = {};
			edge_style['line-color'] = coloring(val.time, min_time, max_time);
			cy.style().selector('#'+key).style(edge_style).update();
		}
		*/
	}

	document.getElementById('refresh_button').addEventListener('click', e => {
		let dat_text = document.getElementById('dat_textarea').value;
		try{
			dat = JSON.parse(dat_text);
		} catch(err) {
			//console.log('dat_textarea parse error!');
			document.getElementById('dat_textarea').classList.add('dat_textarea_error');
			return;
		}

		//recalc
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				let node_class = node_type.replace('_obj', '_class');
				if (node_type === 'core_obj') {
					let dpf = string_to_double(dat[node_class][val.class]['dp_flops'], 'FLOPS')
					let spf = string_to_double(dat[node_class][val.class]['sp_flops'], 'FLOPS')
					val.time_flops = (val.num_dp_flops / dpf) + (val.num_sp_flops / spf);
					let ips = string_to_double(dat[node_class][val.class]['ips'], 'IPS')
					val.time_inst = val.num_inst / ips;
					val.time = Math.max(val.time_flops, val.time_inst);
				} else {
					let rbw = string_to_double(dat[node_class][val.class]['read_bandwidth'], 'B/s')
					let wbw = string_to_double(dat[node_class][val.class]['write_bandwidth'], 'B/s')
					//check if duplex key exists
					if ('duplex' in dat[node_class][val.class]) {
						if (dat[node_class][val.class]['duplex'] === 'full') {
							val.time = Math.max((val.bytes_read / rbw), (val.bytes_write / wbw));
						} else {
							//should be half
							val.time = (val.bytes_read / rbw) + (val.bytes_write / wbw);
						}
					} else {
						//half as a default
						val.time = (val.bytes_read / rbw) + (val.bytes_write / wbw);
					}
				}
			}
		});

		refresh_textarea();
		refresh_cy_via_dat();
	});

	document.getElementById('label_numa_node_button').addEventListener('click', e => {
		let numa_node_num = parseInt(document.getElementById('numa_node_num_input').value);
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			switch(node_type){
				case 'core_obj': dat.core_obj[selected_id].numa_node = numa_node_num; break;
				case 'cache_obj': dat.cache_obj[selected_id].numa_node = numa_node_num; break;
				case 'mem_obj': dat.mem_obj[selected_id].numa_node = numa_node_num; break;
				case 'router_obj': dat.router_obj[selected_id].numa_node = numa_node_num; break;
			}
		}
		refresh_textarea();
		refresh_cy_via_dat();
	});

	var current_selected_dat_id;

	document.getElementById('dat_selectbox').addEventListener('change', e => {
		current_selected_dat_id = e.target.value;
		dat = dat_list[e.target.value].dat;
		refresh_textarea();
		refresh_cy_via_dat();
	});

	document.getElementById('create_new_dat').addEventListener('click', e => {
		let new_empty_dat = _.cloneDeep(empty_dat); //deep copy
		add_a_dat('machine.dat', new_empty_dat);
	});

	document.getElementById('delete_dat').addEventListener('click', e => {
		if (Object.keys(dat_list).length <= 1) { return; }

		//delete the DOM
		document.getElementById('dat_selectbox').querySelector('[value="'+current_selected_dat_id+'"]').remove();

		//delete from dat_list
		delete dat_list[current_selected_dat_id];

		//select an other dat
		current_selected_dat_id	= Object.keys(dat_list)[0];
		document.getElementById('dat_selectbox').querySelector('[value="'+current_selected_dat_id+'"]').selected = true;
		dat = dat_list[current_selected_dat_id].dat;
		refresh_textarea();
		refresh_cy_via_dat();
	});

	document.getElementById('rename_dat').addEventListener('click', e => {
		let new_name = window.prompt("Please input a name for this dat", dat_list[current_selected_dat_id].name);
		if ((new_name == '') || (new_name == null)){
			new_name = dat_list[current_selected_dat_id].name;
		}
		dat_list[current_selected_dat_id].name = new_name;
		document.getElementById('dat_selectbox').querySelector('[value="'+current_selected_dat_id+'"]').innerText = new_name;
	});

	//----------------------------------------------------------------
	//util

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function find_node_type_include_id(id){
		let return_val = 'edge_obj';
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			if((Object.keys(dat[node_type])).includes(id)){
				return_val = node_type;
				return;
			}
		});
		return return_val;
	}

	function refresh_textarea(){
		//document.getElementById('dat_textarea').value = JSON.stringify(cy.json(), null, "\t");
		document.getElementById('dat_textarea').value = JSON.stringify(dat, null, "\t");
		document.getElementById('dat_textarea').classList.remove('dat_textarea_error');
	}

	function gen_color(num,cmin,cmax){
		//pink rgb(255,0,255)
		//cyan rgb(0,255,255)

		let range = cmax-cmin;
		let red = Math.floor(255.0*(num-cmin)/range);
		let green = Math.floor(255.0*(cmax-num)/range);

		let color_s = 'rgb(' + String(red) + ',' + String(green) + ',255)';

		//return 'rgb(255,0,0)';
		return color_s;
	}

	function string_to_double(whole_s, deg_s){
		let sp_s = whole_s.toLowerCase().split(' ');
		let p = sp_s[1].replace(deg_s.toLowerCase(), '');
		return parseFloat(sp_s[0]) * calc_metric_prefix(p);
	}

	function calc_metric_prefix(p){
		if      (p == "k" ) { return Math.pow(1000,1); } 
		else if (p == "m" ) { return Math.pow(1000,2); } 
		else if (p == "g" ) { return Math.pow(1000,3); } 
		else if (p == "t" ) { return Math.pow(1000,4); } 
		else if (p == "p" ) { return Math.pow(1000,5); } 
		else if (p == "e" ) { return Math.pow(1000,6); } 
		else if (p == "z" ) { return Math.pow(1000,7); } 
		else if (p == "y" ) { return Math.pow(1000,8); } 
		else if (p == "ki") { return Math.pow(1024,1); } 
		else if (p == "mi") { return Math.pow(1024,2); } 
		else if (p == "gi") { return Math.pow(1024,3); } 
		else if (p == "ti") { return Math.pow(1024,4); } 
		else if (p == "pi") { return Math.pow(1024,5); } 
		else if (p == "ei") { return Math.pow(1024,6); } 
		else if (p == "zi") { return Math.pow(1024,7); } 
		else if (p == "yi") { return Math.pow(1024,8); } 
		else { console.log("Error: Unknown metric prefix"); }
	}

	function add_a_dat(name, dat_dict){
		let dat_unique_id = uuidv4();

		let temp_obj = {};
		temp_obj['name'] = name;
		temp_obj['dat'] = dat_dict;
		dat_list[dat_unique_id] = temp_obj;

		let op = document.createElement('option');
		op.value = dat_unique_id;
		op.text = name;
		op.selected = true;
		document.getElementById('dat_selectbox').appendChild(op);

		current_selected_dat_id = dat_unique_id;
		dat = dat_dict;
		refresh_textarea();
		refresh_cy_via_dat();
	}

	//----------------------------------------------------------------
	//gererate functions

	var core_obj_num = -1;
	function generate_default_core_obj(){
		core_obj_num++;
		return {
			'name': 'Core-'+core_obj_num,
			'class': 'default',
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': 0,
			'num_dp_flops': 0,
			'num_sp_flops': 0,
			'num_inst': 0,
			'time_flops': 0,
			'time_inst': 0,
			'time': 0,
		};
	}

	var cache_obj_num = -1; //0
	var cache_l1_obj_num = -1; //1
	var cache_l2_obj_num = -1; //2
	var cache_l3_obj_num = -1; //3
	function generate_default_cache_obj(class_num){
		let name_prefix;
		let num_this_time;
		switch(class_num){
			case 0:
				name_prefix = 'Cache-';
				cache_obj_num++;
				num_this_time = cache_obj_num;
				break;
			case 1:
				name_prefix = 'L1-';
				cache_l1_obj_num++;
				num_this_time = cache_l1_obj_num;
				break;
			case 2:
				name_prefix = 'L2-';
				cache_l2_obj_num++;
				num_this_time = cache_l2_obj_num;
				break;
			case 3:
				name_prefix = 'L3-';
				cache_l3_obj_num++;
				num_this_time = cache_l3_obj_num;
				break;
		}

		return {
			'name': name_prefix + num_this_time,
			'class': 'default',
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': 0,
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var mem_obj_num = -1;
	function generate_default_mem_obj(){
		mem_obj_num++;
		return {
			'name': 'Mem-'+mem_obj_num,
			'class': 'default',
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': 0,
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var router_obj_num = -1;
	function generate_default_router_obj(){
		router_obj_num++;
		return {
			'name': 'Router-'+router_obj_num,
			'class': 'default',
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': 0,
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var edge_obj_num = -1;
	function generate_default_edge_obj(){
		edge_obj_num++;
		return {
			'name': 'Edge-'+edge_obj_num,
			'class': 'default',
			'source': '',
			'target': '',
		};
	}

	//----------------------------------------------------------------
	//Tooltip
	var tip;

	cy.on('mouseover', 'node', e => {
		let id = e.target.data('id');
		let exist = false;
		let nt = '';

		//check existence
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				if(key === id) { exist = true; nt = node_type;  return; }
			}
		});
		if(!exist) { return; }

		//prepare tooltip text
		let tip_text = '';
		if(nt === 'core_obj') {
			//core
			tip_text += 'num_dp_flops: ' + dat[nt][id]['num_dp_flops'].toPrecision(3) + '<br>'
			tip_text += 'num_sp_flops: ' + dat[nt][id]['num_sp_flops'].toPrecision(3) + '<br>'
			tip_text += 'num_inst: ' + dat[nt][id]['num_inst'].toPrecision(3) + '<br>'
			tip_text += 'time_flops: ' + dat[nt][id]['time_flops'].toPrecision(3) + '<br>'
			tip_text += 'time_inst: ' + dat[nt][id]['time_inst'].toPrecision(3) + '<br>'
			tip_text += 'time: ' + dat[nt][id]['time'].toPrecision(3) + '<br>'
		} else {
			//cache,mem,router
			tip_text += 'num_read: ' + dat[nt][id]['num_read'].toPrecision(3) + '<br>'
			tip_text += 'num_write: ' + dat[nt][id]['num_write'].toPrecision(3) + '<br>'
			tip_text += 'bytes_read: ' + dat[nt][id]['bytes_read'].toPrecision(3) + '<br>'
			tip_text += 'bytes_write: ' + dat[nt][id]['bytes_write'].toPrecision(3) + '<br>'
			tip_text += 'time: ' + dat[nt][id]['time'].toPrecision(3) + '<br>'
		}

		let ele = e.target;
		let ref = ele.popperRef();

		// Since tippy constructor requires DOM element/elements, create a placeholder
		let dummyDomEle = document.createElement('div');

		tip = tippy(dummyDomEle, {
			getReferenceClientRect: ref.getBoundingClientRect,
			trigger: 'manual', // mandatory
			// dom element inside the tippy:
			content: function(){ // function can be better for performance
				let div = document.createElement('div');
				div.className = 'tippy_class';
				div.innerHTML = tip_text;
				return div;
			},
			// your own preferences:
			arrow: true,
			placement: 'bottom',
			hideOnClick: true,
			sticky: 'reference',
			interactive: true,
			appendTo: document.body // or append dummyDomEle to document.body
		});

		tip.show();

	});

	cy.on('mouseout', 'node', e => {
		tip.destroy();
	});

//----------------------------------------------------------------
}

//----------------------------------------------------------------
main();

//----------------------------------------------------------------






