
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
		//see generate_core_default_class() for detail
		'core_class': {}, 'cache_class': {}, 'mem_class': {}, 'router_class': {}, 'edge_class': {},
		//see generate_core_obj() for detail
		'core_obj': {}, 'cache_obj': {}, 'mem_obj': {}, 'router_obj': {}, 'edge_obj': {},
	};

	dat['core_class']['default'] = generate_core_default_class();

	dat['cache_class']['default'] = generate_cache_default_class();
	dat['cache_class']['l1'] = generate_cache_default_class();
	dat['cache_class']['l1']['name'] = 'L1';
	dat['cache_class']['l1']['color'] = '#FDC285';
	dat['cache_class']['l1']['width'] = '40';
	dat['cache_class']['l1']['height'] = '40';
	dat['cache_class']['l2'] = generate_cache_default_class();
	dat['cache_class']['l2']['name'] = 'L2';
	dat['cache_class']['l2']['color'] = '#8AFEA1';
	dat['cache_class']['l2']['width'] = '50';
	dat['cache_class']['l2']['height'] = '50';
	dat['cache_class']['l3'] = generate_cache_default_class();
	dat['cache_class']['l3']['name'] = 'L3';
	dat['cache_class']['l3']['slice'] = 'true';
	dat['cache_class']['l3']['color'] = '#65F7C2';
	dat['cache_class']['l3']['width'] = '60';
	dat['cache_class']['l3']['height'] = '60';

	dat['mem_class']['default'] = generate_mem_default_class();
	dat['mem_class']['dram'] = generate_mem_default_class();
	dat['mem_class']['dram']['name'] = 'DRAM';
	dat['mem_class']['hbm'] = generate_mem_default_class();
	dat['mem_class']['hbm']['name'] = 'HBM';
	dat['mem_class']['hbm']['type'] = 'sub';
	dat['mem_class']['hbm']['color'] = '#74DCFA';
	dat['mem_class']['dcpmm'] = generate_mem_default_class();
	dat['mem_class']['dcpmm']['name'] = 'DCPMM';
	dat['mem_class']['dcpmm']['type'] = 'sub';
	dat['mem_class']['dcpmm']['sub_id'] = 1;
	dat['mem_class']['dcpmm']['color'] = '#8DB0FA';
	dat['mem_class']['dcpmm']['width'] = '80';
	dat['mem_class']['dcpmm']['height'] = '80';
	dat['mem_class']['scratchpad'] = generate_mem_default_class();
	dat['mem_class']['scratchpad']['name'] = 'SPM';
	dat['mem_class']['scratchpad']['type'] = 'scratchpad';
	dat['mem_class']['scratchpad']['width'] = '40';
	dat['mem_class']['scratchpad']['height'] = '40';
	dat['mem_class']['scratchpad']['color'] = '#5EF9EE';

	dat['router_class']['default'] = generate_router_default_class();
	dat['router_class']['socket_port'] = generate_router_default_class();
	dat['router_class']['socket_port']['name'] = 'Socket_Port';

	dat['edge_class']['default'] = generate_edge_default_class();
	dat['edge_class']['core-l1'] = generate_edge_default_class();
	dat['edge_class']['l1-l2'] = generate_edge_default_class();
	dat['edge_class']['l2-l3'] = generate_edge_default_class();
	dat['edge_class']['l3-mem'] = generate_edge_default_class();
	dat['edge_class']['l3-mem']['duplex'] = 'half';
	dat['edge_class']['sockets'] = generate_edge_default_class();
	dat['edge_class']['sockets']['duplex'] = 'half';
	dat['edge_class']['simplex'] = generate_edge_default_class();
	dat['edge_class']['simplex']['duplex'] = 'simplex';
	dat['edge_class']['simplex']['shape'] = 'triangle';

	var selected_node_type = 'core'; // init
	var selected_node_class = 'default'; // init
	var class_dict = {'core': [], 'cache': [], 'mem': [], 'router': [], 'edge': []}; //init

	var empty_dat = _.cloneDeep(dat); //deep copy

	var dat_list = {};
	add_a_dat('machine.dat', dat);

	refresh_button_func();

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
				style: {'content': 'data(name)', 'color': '#5A5A5A', 'font-size': node_font_size} },
			{ selector: 'edge',
				style: {'curve-style': 'bezier', 'control-point-step-size': 20, 'line-color': '#BCBCBC', 'target-arrow-shape': 'triangle', 'arrow-scale': 1.5} },
			//#A4A4A4 (->BCBCBC) or #D8D8D8
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
			if(parseInt(val.numa_node) === -1) {
				obj_style.style['background-color'] = "#BCBCBC";
			} else if(dat.core_class[val.class].color) {
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
			if(parseInt(val.numa_node) === -1) {
				obj_style.style['background-color'] = "#BCBCBC";
			} else if(dat.cache_class[val.class].color) {
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
			if(parseInt(val.numa_node) === -1) {
				obj_style.style['background-color'] = "#BCBCBC";
			} else if(dat.mem_class[val.class].color) {
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
			if(parseInt(val.numa_node) === -1) {
				obj_style.style['background-color'] = "#BCBCBC";
			} else if(dat.router_class[val.class].color) {
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
				obj_style.style['target-arrow-color'] = dat.edge_class[val.class].color;
				obj_style.style['source-arrow-color'] = dat.edge_class[val.class].color;
			}
			if(dat.edge_class[val.class].width) {
				obj_style.style['width'] = dat.edge_class[val.class].width;
			}
			if(dat.edge_class[val.class].shape) {
				obj_style.style['target-arrow-shape'] = dat.edge_class[val.class].shape;
				obj_style.style['source-arrow-shape'] = dat.edge_class[val.class].shape;
			}
			if(dat.edge_class[val.class].duplex) {
				if(dat.edge_class[val.class].duplex === 'simplex') {
					if(dat.edge_class[val.class].shape) {
						obj_style.style['source-arrow-shape'] = 'none';
					}
				}
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
		if ((selected_node_type === 'edge') && (one_click_mode)) {
			dat.edge_obj[a.data('id')] = generate_edge_obj(selected_node_class);
			dat.edge_obj[a.data('id')].source = s.data('id');
			dat.edge_obj[a.data('id')].target = t.data('id');
		} else if (one_click_mode) {
			dat.edge_obj[a.data('id')] = generate_edge_obj('default');
			dat.edge_obj[a.data('id')].source = s.data('id');
			dat.edge_obj[a.data('id')].target = t.data('id');
		}
		refresh_textarea();
		refresh_cy_via_dat();
	});

	//----------------------------------------------------------------
	//When a node is selected

	var selected_id_list = [];

	//when select multiple objects, this will be called also multiple times
	cy.on('select', e => {
		//console.log(e.target.data('id'));
		//console.log(e.target.position('x'));
		selected_id_list.push(e.target.data('id'));
		e.target.style({'background-color': 'red', 'line-color': 'red', 'target-arrow-color': 'red', 'source-arrow-color': 'red', 'target-arrow-shape': 'triangle', 'background-fill': 'solid'});

		scroll_textarea_to_obj(e.target.data('id'));
	});

	cy.on('unselect', e => {
		//console.log(e.target.data('id'));
		//console.log(e.target.position('x'));
		selected_id_list = selected_id_list.filter(a => {return a !== e.target.data('id');});
		e.target.style({'background-color': '', 'line-color': '', 'target-arrow-color': '', 'source-arrow-color': '', 'target-arrow-shape': '', 'background-fill': ''});
	});

	//----------------------------------------------------------------
	//One-click generating a node

	cy.on('tap', e => {
		if (!one_click_mode) return;
		if (selected_node_type === 'edge') return;

		let id = uuidv4();

		switch(selected_node_type){
			case 'core':
				dat.core_obj[id] = generate_core_obj(selected_node_class);
				dat.core_obj[id].position.x = e.position.x;
				dat.core_obj[id].position.y = e.position.y;
				break;
			case 'cache':
				dat.cache_obj[id] = generate_cache_obj(selected_node_class);
				dat.cache_obj[id].position.x = e.position.x;
				dat.cache_obj[id].position.y = e.position.y;
				break;
			case 'mem':
				dat.mem_obj[id] = generate_mem_obj(selected_node_class);
				dat.mem_obj[id].position.x = e.position.x;
				dat.mem_obj[id].position.y = e.position.y;
				break;
			case 'router':
				dat.router_obj[id] = generate_router_obj(selected_node_class);
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

	document.getElementById('select_node_type').addEventListener('change', e => {
		selected_node_type = e.target.value;
		refresh_class_selectbox();
		scroll_textarea_to_class();
	});

	document.getElementById('select_node_class').addEventListener('change', e => {
		selected_node_class = e.target.value;
		scroll_textarea_to_class();
	});

	document.getElementById('copy_node_button').addEventListener('click', e => {
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
					dat.core_obj[id] = generate_core_obj(dat.core_obj[selected_id].class);
					dat.core_obj[id].position.x = dat.core_obj[selected_id].position.x + 50;
					dat.core_obj[id].position.y = dat.core_obj[selected_id].position.y + 50;
					break;
				case 'cache_obj':
					dat.cache_obj[id] = generate_cache_obj(dat.cache_obj[selected_id].class);
					dat.cache_obj[id].position.x = dat.cache_obj[selected_id].position.x + 50;
					dat.cache_obj[id].position.y = dat.cache_obj[selected_id].position.y + 50;
					break;
				case 'mem_obj':
					dat.mem_obj[id] = generate_mem_obj(dat.mem_obj[selected_id].class);
					dat.mem_obj[id].position.x = dat.mem_obj[selected_id].position.x + 50;
					dat.mem_obj[id].position.y = dat.mem_obj[selected_id].position.y + 50;
					break;
				case 'router_obj':
					dat.router_obj[id] = generate_router_obj(dat.router_obj[selected_id].class);
					dat.router_obj[id].position.x = dat.router_obj[selected_id].position.x + 50;
					dat.router_obj[id].position.y = dat.router_obj[selected_id].position.y + 50;
					break;
			}
		}

		//edges
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			if(node_type !== 'edge_obj') { continue; }

			//When both source/target of the selected edge are also selected, the edge can be copied
			if((selected_id_list.includes(dat.edge_obj[selected_id].source)) && (selected_id_list.includes(dat.edge_obj[selected_id].target))) {
				let id = uuidv4();
				new_id_list.push(id);
				dat.edge_obj[id] = generate_edge_obj(dat.edge_obj[selected_id].class);
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
		dat_list[current_selected_dat_id].dat = dat; //save current dat
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
				if(!val.numa_node){
					//no numa_node key
					let this_obj_style = {};
					this_obj_style['background-color'] = numa_node_color_list[0];
					cy.style().selector('#'+key).style(this_obj_style).update();

				} else if (val.numa_node.split(',').length === 1) {
					//single color
					let this_obj_style = {};
					this_obj_style['background-color'] = numa_node_color_list[parseInt(val.numa_node)%8];
					if(parseInt(val.numa_node) === -1){
						this_obj_style['background-color'] = '#BCBCBC';
					}
					cy.style().selector('#'+key).style(this_obj_style).update();

				} else {
					//multiple nn, multiple colors
					let nn_list = val.numa_node.split(',').map(Number);
					let stop_color_str = '';
					let stop_pos_str = '';
					let temp_count = 0;
					for (const one_nn of nn_list) {
						let one_color = String(numa_node_color_list[one_nn%8]);
						stop_color_str += ( one_color + ' ' + one_color + ' ' );
						stop_pos_str += String( Math.floor(100/nn_list.length) * temp_count);
						stop_pos_str += '% ';
						stop_pos_str += String( Math.floor(100/nn_list.length) * (temp_count+1));
						stop_pos_str += '% ';
						temp_count++;
					}
					//console.log(stop_color_str);
					//console.log(stop_pos_str);

					//example
					//this_obj_style['background-gradient-stop-colors'] = 'cyan cyan test test magenta magenta';
					//this_obj_style['background-gradient-stop-positions'] = '0% 33%% 33% 66% 66% 100%';
					//this_obj_style['background-gradient-stop-colors'] = 'cyan cyan magenta magenta';
					//this_obj_style['background-gradient-stop-positions'] = '0% 50% 50% 100%';

					let this_obj_style = {};
					this_obj_style['background-fill'] = 'linear-gradient';
					this_obj_style['background-gradient-stop-colors'] = stop_color_str;
					this_obj_style['background-gradient-stop-positions'] = stop_pos_str;
					this_obj_style['background-gradient-direction'] = 'to-bottom-right';
					cy.style().selector('#'+key).style(this_obj_style).update();
				}

			}
		});
	}

	function coloring_with_result(){
		let max_time = 0;
		let min_time = Number.MAX_VALUE;

		['core_obj', 'cache_obj', 'mem_obj', 'router_obj', 'edge_obj'].forEach(node_type => {
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
			cy.style().selector('#'+key).style({'background-color': '#BCBCBC'}).update();
		}

		['core_obj', 'cache_obj', 'mem_obj', 'router_obj', 'edge_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				let color_temp;
				if(val.time > 0){
					color_temp = gen_color(val.time, min_time, max_time);
				} else {
					color_temp = '#BCBCBC';
				}
				let this_obj_style = {};
				if (node_type === 'edge_obj') {
					this_obj_style['line-color'] = color_temp;
					this_obj_style['target-arrow-color'] = color_temp;
					this_obj_style['source-arrow-color'] = color_temp;
				} else {
					this_obj_style['background-color'] = color_temp;
				}
				cy.style().selector('#'+key).style(this_obj_style).update();
			}
		});
	}

	function refresh_class_selectbox(){
		let selectbox_div = document.getElementById('select_node_class');

		//delete all
		while (selectbox_div.firstChild) {
			selectbox_div.removeChild(selectbox_div.firstChild);
		}

		//fill all
		let first_one = true;
		class_dict[selected_node_type].forEach(class_name => {
			if(first_one) {
				selected_node_class = class_name; // The first one is set selected
				first_one = false;
				selectbox_div.innerHTML += '<option value="' + class_name + '" selected>' + class_name + '</option>';
			} else {
				selectbox_div.innerHTML += '<option value="' + class_name + '">' + class_name + '</option>';
			}
		});
	}

	function update_class_dict() {
		['core', 'cache', 'mem', 'router', 'edge'].forEach(node_type => {
			class_dict[node_type].length = 0; //delete all elements
			//reconstruct all
			for (const [key, val] of Object.entries(dat[node_type+'_class'])){
				class_dict[node_type].push(key);
			}
		});
	}

	function refresh_button_func() {
		let dat_text = document.getElementById('dat_textarea').value;
		try{
			dat = JSON.parse(dat_text);
		} catch(err) {
			//console.log('dat_textarea parse error!');
			document.getElementById('dat_textarea').classList.add('dat_textarea_error');
			return;
		}

		update_class_dict();
		refresh_class_selectbox();

		//recalc
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj', 'edge_obj'].forEach(node_type => {
			for (const [key, val] of Object.entries(dat[node_type])){
				let node_class = node_type.replace('_obj', '_class');
				if (node_type === 'core_obj') {
					let dpf = string_to_double(dat[node_class][val.class]['dp_flops'], 'FLOPS')
					let spf = string_to_double(dat[node_class][val.class]['sp_flops'], 'FLOPS')
					val.time_flops = (val.num_dp_flops / dpf) + (val.num_sp_flops / spf);
					let ips = string_to_double(dat[node_class][val.class]['ips'], 'IPS')
					val.time_inst = val.num_inst / ips;
					val.time = Math.max(val.time_flops, val.time_inst);
				} else if (node_type === 'edge_obj') {

					let s2tbw = string_to_double(dat[node_class][val.class]['s2t_bandwidth'], 'B/s')
					let t2sbw = string_to_double(dat[node_class][val.class]['t2s_bandwidth'], 'B/s')
					//check if duplex key exists
					if ('duplex' in dat[node_class][val.class]) {
						if (dat[node_class][val.class]['duplex'] === 'full') {
							val.time = Math.max((val.bytes_s2t / s2tbw), (val.bytes_t2s / t2sbw));
						} else if (dat[node_class][val.class]['duplex'] === 'half') {
							val.time = (val.bytes_s2t / s2tbw) + (val.bytes_t2s / t2sbw);
						} else if (dat[node_class][val.class]['duplex'] === 'simplex') {
							val.time = val.bytes_s2t / s2tbw;
						} else {
							//half as a default
							val.time = (val.bytes_s2t / s2tbw) + (val.bytes_t2s / t2sbw);
						}
					} else {
						//half as a default
						val.time = (val.bytes_s2t / s2tbw) + (val.bytes_t2s / t2sbw);
					}
				} else {
					let rbw = string_to_double(dat[node_class][val.class]['read_bandwidth'], 'B/s')
					let wbw = string_to_double(dat[node_class][val.class]['write_bandwidth'], 'B/s')
					//check if duplex key exists
					if ('duplex' in dat[node_class][val.class]) {
						if (dat[node_class][val.class]['duplex'] === 'full') {
							val.time = Math.max((val.bytes_read / rbw), (val.bytes_write / wbw));
						} else {
							//half duplex
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
	}

	document.getElementById('refresh_button').addEventListener('click', refresh_button_func);

	document.getElementById('label_numa_node_button').addEventListener('click', e => {
		let numa_node_num = parseInt(document.getElementById('numa_node_num_input').value);
		for(let selected_id of selected_id_list){
			let node_type = find_node_type_include_id(selected_id);
			switch(node_type){
				case 'core_obj': dat.core_obj[selected_id].numa_node = String(numa_node_num); break;
				case 'cache_obj': dat.cache_obj[selected_id].numa_node = String(numa_node_num); break;
				case 'mem_obj': dat.mem_obj[selected_id].numa_node = String(numa_node_num); break;
				case 'router_obj': dat.router_obj[selected_id].numa_node = String(numa_node_num); break;
			}
		}
		refresh_textarea();
		refresh_cy_via_dat();
	});

	var current_selected_dat_id;

	document.getElementById('dat_selectbox').addEventListener('change', e => {
		dat_list[current_selected_dat_id].dat = dat; //save current dat
		current_selected_dat_id = e.target.value;
		dat = dat_list[e.target.value].dat;
		refresh_textarea();
		refresh_cy_via_dat();
		update_class_dict();
		refresh_class_selectbox();
	});

	document.getElementById('create_new_dat').addEventListener('click', e => {
		dat_list[current_selected_dat_id].dat = dat; //save current dat
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

	var new_class_num = -1;
	document.getElementById('add_class_button').addEventListener('click', e => {
		new_class_num++;
		switch(selected_node_type){
			case 'core':
				dat['core_class']['new'+new_class_num] = generate_core_default_class();
				break;
			case 'cache':
				dat['cache_class']['new'+new_class_num] = generate_cache_default_class();
				break;
			case 'mem':
				dat['mem_class']['new'+new_class_num] = generate_mem_default_class();
				break;
			case 'router':
				dat['router_class']['new'+new_class_num] = generate_router_default_class();
				break;
			case 'edge':
				dat['edge_class']['new'+new_class_num] = generate_edge_default_class();
				break;
		}

		selected_node_class = 'new'+new_class_num;

		//class selectbox
		update_class_dict();
		refresh_class_selectbox();

		//DAT json textarea
		refresh_textarea();

		//just added, not scroll to new class
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
		let red;
		let green;
		if (range === 0) {
			red = 0;
			green = 255;
		} else {
			red = Math.floor(255.0*(num-cmin)/range);
			green = Math.floor(255.0*(cmax-num)/range);
		}

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
		update_class_dict();
		refresh_class_selectbox();
	}

	function scroll_textarea_to_class() {
		let textarea_ele = document.getElementById('dat_textarea');
		let all_lines = textarea_ele.value.split('\n');

		let obj_type_flag = false;
		for (let i=0; i<all_lines.length; i++) {
			if (all_lines[i].indexOf(selected_node_type + '_class') > 0) {
				obj_type_flag = true;
			}

			if (obj_type_flag) {
				if (all_lines[i].indexOf(selected_node_class) > 0) {
					let scroll_size = textarea_ele.scrollHeight / all_lines.length;
					textarea_ele.scrollTop = scroll_size * i;
					return;
				}
			}
		}
	}

	function scroll_textarea_to_obj(obj_id) {
		let textarea_ele = document.getElementById('dat_textarea');
		let all_lines = textarea_ele.value.split('\n');

		for (let i=0; i<all_lines.length; i++) {
			if (all_lines[i].indexOf(obj_id) > 0) {
				let scroll_size = textarea_ele.scrollHeight / all_lines.length;
				textarea_ele.scrollTop = scroll_size * i;
				return;
			}
		}
	}


	//----------------------------------------------------------------
	//generate functions

	var core_name_dict = {};
	function generate_core_obj(class_name){
		if (!core_name_dict.hasOwnProperty(class_name)) {
			//key doesn't exist
			core_name_dict[class_name] = -1;
		}
		core_name_dict[class_name] += 1;
		return {
			'name': dat['core_class'][class_name]['name'] + '-' +  core_name_dict[class_name],
			'class': class_name,
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': '0',
			'num_dp_flops': 0,
			'num_sp_flops': 0,
			'num_inst': 0,
			'time_flops': 0,
			'time_inst': 0,
			'time': 0,
		};
	}

	var cache_name_dict = {};
	function generate_cache_obj(class_name){
		if (!cache_name_dict.hasOwnProperty(class_name)) {
			//key doesn't exist
			cache_name_dict[class_name] = -1;
		}
		cache_name_dict[class_name] += 1;

		return {
			'name': dat['cache_class'][class_name]['name'] + '-' + cache_name_dict[class_name],
			'class': class_name,
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': '0',
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var mem_name_dict = {};
	function generate_mem_obj(class_name){
		if (!mem_name_dict.hasOwnProperty(class_name)) {
			//key doesn't exist
			mem_name_dict[class_name] = -1;
		}
		mem_name_dict[class_name] += 1;

		return {
			'name': dat['mem_class'][class_name]['name'] + '-' + mem_name_dict[class_name],
			'class': class_name,
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': '0',
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var router_name_dict = {};
	function generate_router_obj(class_name){
		if (!router_name_dict.hasOwnProperty(class_name)) {
			//key doesn't exist
			router_name_dict[class_name] = -1;
		}
		router_name_dict[class_name] += 1;

		return {
			'name': dat['router_class'][class_name]['name'] + '-' + router_name_dict[class_name],
			'class': class_name,
			'position': {
				'x': 0,
				'y': 0
			},
			'numa_node': '0',
			'num_read': 0,
			'num_write': 0,
			'bytes_read': 0,
			'bytes_write': 0,
			'time': 0,
		};
	}

	var edge_name_num = -1;
	function generate_edge_obj(class_name){
		edge_name_num++;

		return {
			'name': dat['edge_class'][class_name]['name'] + '-' + edge_name_num,
			'class': class_name,
			'source': '',
			'target': '',
			'num_s2t': 0,
			'num_t2s': 0,
			'bytes_s2t': 0,
			'bytes_t2s': 0,
			'time': 0,
		};
	}

	function generate_core_default_class(){
		return {
			'name': 'Core',
			'dp_flops': '1.0 GFLOPS',
			'sp_flops': '0.5 GFLOPS',
			'ips': '1.0 GIPS',
			'color': '#FF9DCE',
			'shape': 'rectangle',
			'width': '30',
			'height': '30',
			"comment": '',
		};
	}

	function generate_cache_default_class(){
		return {
			'name': 'Cache',
			'capacity': '32 KiB',
			'associativity': 8,
			'linesize': 64,
			'read_bandwidth': '100.0 GB/s',
			'write_bandwidth': '100.0 GB/s',
			'duplex': 'full',
			'slice': 'false',
			'color': '#FDC285',
			'shape': 'rectangle',
			'width': '40',
			'height': '40',
		};
	}

	function generate_mem_default_class(){
		return {
			'name': 'Mem',
			'capacity': '1 GiB',
			'linesize': 64,
			'read_bandwidth': '100.0 GB/s',
			'write_bandwidth': '100.0 GB/s',
			'duplex': 'half',
			'type': 'main',
			'sub_id': 0,
			'color': '#7AC6FD',
			'shape': 'rectangle',
			'width': '70',
			'height': '70',
		};
	}

	function generate_router_default_class(){
		return {
			'name': 'Router',
			'read_bandwidth': '100.0 GB/s',
			'write_bandwidth': '100.0 GB/s',
			'duplex': 'half',
			'color': '#9AA4FE',
			'shape': 'diamond',
			'width': '20',
			'height': '20',
		};
	}

	function generate_edge_default_class(){
		return {
			'name': 'Edge',
			's2t_bandwidth': '100.0 GB/s',
			't2s_bandwidth': '100.0 GB/s',
			'duplex': 'full',
			'color': '#BCBCBC',
			'width': '3',
			'shape': 'none',
		};
	}

	//----------------------------------------------------------------
	//Tooltip
	var tip;

	cy.on('mouseover', 'ele', e => {
		let id = e.target.data('id');
		let exist = false;
		let nt = '';

		//check existence
		['core_obj', 'cache_obj', 'mem_obj', 'router_obj', 'edge_obj'].forEach(node_type => {
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
		} else if(nt === 'edge_obj') {
			tip_text += 'num_s2t: ' + dat[nt][id]['num_s2t'].toPrecision(3) + '<br>'
			tip_text += 'num_t2s: ' + dat[nt][id]['num_t2s'].toPrecision(3) + '<br>'
			tip_text += 'bytes_s2t: ' + dat[nt][id]['bytes_s2t'].toPrecision(3) + '<br>'
			tip_text += 'bytes_t2s: ' + dat[nt][id]['bytes_t2s'].toPrecision(3) + '<br>'
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

	cy.on('mouseout', 'ele', e => {
		tip.destroy();
	});

	//----------------------------------------------------------------
	//Realtime
	document.getElementById('dat_textarea').addEventListener('input', e => {
		let dat_text = document.getElementById('dat_textarea').value;
		try{
			dat = JSON.parse(dat_text);
			refresh_cy_via_dat();
		} catch(e) {
			//console.log('dat_textarea parse error!');
			document.getElementById('dat_textarea').classList.add('dat_textarea_error');
		}
	});

//----------------------------------------------------------------
}

//----------------------------------------------------------------
main();

//----------------------------------------------------------------






