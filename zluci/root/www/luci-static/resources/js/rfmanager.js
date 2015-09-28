var dataCon,
	cloneData = {},
	diagAdjustAps,
	power_channel;

//页面加载初始化
$(document).ready(function() {
	diagAdjustAps = createDiagAdjustAps();
	oTableApList = createDtApList();
	initData();
	initEvent();
});

function createDtApList() {
	return $('#ap_list').dataTable({
		"bProcessing": false,
		"sServerMethod": "POST",
		"sAjaxDataProp": "",
		"sPaginationType": "full_numbers",
		"bSort": true,
		"iDisplayLength": 10,
		"aoColumns": [
			{
				"mData": "Name"
			},
			{ 
				"mData": null,
				"bSortable": false,
				"mRender": function() {
					return '<input type="checkbox">';
				}
			}
		],
		"fnRowCallback": dtBindRowSelectEvents
	})
}

function createDiagAdjustAps() {
	return $('#adjust_aps').dialog({
		"title":'选择立即调整AP',
		"closed": true,
		"modal": true,
		"resizable": true,
    	"width": 560,
		"height": 460,
		"buttons":[{
				text:'确定',
				handler:function() {
					saveSubmit(power_channel, true);
				}
			},
			{
				text:'取消',
				handler:function() {
					$('#adjust_aps').dialog('close');
				}
			}
		]
	});	
}

//2g 5g调整为空时或超出范围 自动添加默认值
function saveDefault(d) {
	var p_2g = d.power.adjust_2g,
		c_2g = d.channel.adjust_2g,
		p_5g = d.power.adjust_5g,
		c_5g = d.channel.adjust_5g;
		
	p_2g.rssi_limit = saveIfParseInt(p_2g.rssi_limit, -110, -30, "-85");
	p_2g.nap_num = saveIfParseInt(p_2g.nap_num, 0, 10, "2");
	p_2g.best_rssi = saveIfParseInt(p_2g.best_rssi, -110, -30, "-70");
	c_2g.channel_use = saveIfParseInt(c_2g.channel_use, 30, 100, "60");
	c_2g.percent = saveIfParseInt(c_2g.percent, 0, 100, "80");
	
	p_5g.rssi_limit = saveIfParseInt(p_5g.rssi_limit, -110, -30, "-85");
	p_5g.nap_num = saveIfParseInt(p_5g.nap_num, 0, 10, "2");
	p_5g.best_rssi = saveIfParseInt(p_5g.best_rssi, -110, -30, "-70");
	c_5g.channel_use = saveIfParseInt(c_5g.channel_use, 30, 100, "60");
	c_5g.percent = saveIfParseInt(c_5g.percent, 0, 100, "80");
	
	function saveIfParseInt(k, small, big, v) {
		if ($.trim(k) == "" || parseInt(k) > big || parseInt(k) < small) {
			return v;
		} else {
			return parseInt(k);
		}
	}

	return d;
}

function saveSubmit(s, b) {
	if (s == "power_submit") {
		if(!verification(".power-c")){
			return;
		}
	} else if (s == "channel_submit") {
		if(!verification(".channel-c")){
			return;
		}
	}
	
	var obj = {},
		aAPs = [],
		aAPNodes = [];
	
	jsonTraversal(dataCon, jsTravGet);
	dataCon = saveDefault(dataCon);
	
	//后面做成了有用户调整  搞反了
	if (dataCon.power.users_enable == '0') {
		dataCon.power.users_enable = '1';
	} else {
		dataCon.power.users_enable = '0';
	}
	if (dataCon.channel.users_enable == '0') {
		dataCon.channel.users_enable = '1';
	} else {
		dataCon.channel.users_enable = '0';
	}

	if (b) { //立即调整添加 aps
		aAPNodes = dtGetSelected(oTableApList);
		for (var i = aAPNodes.length - 1; i >= 0; i--) {
			aAPs.push(aAPNodes[i].Name);
		};
		obj.aps = aAPs;
	}
	
	obj.data = dataCon;
	obj.oldData = cloneData;
	if (s == "power_submit") {
		cgicall('RDS.SmartPowerSet(%j)', obj, function(d) {
			d.status == '0' ? window.location.reload() : alert('保存失败！');
		})
	} else if (s == "channel_submit") {
		cgicall('RDS.SmartChannelSet(%j)', obj, function(d) {
			d.status == '0' ? window.location.reload() : alert('保存失败！');
		})
	}
}

function openDiagAps() {
	cgicall('RDS.OnlineAplist("")', function(d) {
		dtReloadData(oTableApList, ObjectToArray(d), false);
		diagAdjustAps.dialog("open");
	})	
}

function setTime() {
	try {
		$('#power__time_start,#power__time_end,#channel__time_start,#channel__time_end').timespinner({  
			required: true,  
			showSeconds: false  
		}); 
	}
	catch(e) { console.log(e); }
}

function initData() {
	var bandSup;
	$.ajax({
		type: "post",
		async: false,
		dataType: "json",
		url: "../../../../../q",
		data: {"cmd" : 'RDS.GetBandSupport("")'},
		success: function(data){
			bandSup = data;
			if (data == '2g') {
				$("#power__adjust_5g__enable,#channel__adjust_5g__enable").closest(".control-group").css("display", "none");
				$(".p_5g,.c_5g").css("display", "none");
			} else if (data == '5g') {
				$("#power__adjust_2g__enable,#channel__adjust_2g__enable").closest(".control-group").css("display", "none");
				$(".p_2g,.c_2g").css("display", "none");
			}
		}
	});

	cgicall('RDS.SmartInfo("")', function(d) {
		cloneData = cloneObj(d);
		dataCon = d;
		
		//后面做成了有用户调整  搞反了 
		if (d.power.users_enable == '0') {
			d.power.users_enable = '1';
		} else {
			d.power.users_enable = '0';
		}
		if (d.channel.users_enable == '0') {
			d.channel.users_enable = '1';
		} else {
			d.channel.users_enable = '0';
		}
		
		jsonTraversal(d, jsTravSet);
		adjustEnable(d);
		
		if (bandSup == '2g') {
			$("#power__adjust_5g__enable,#channel__adjust_5g__enable").remove("checked");
			OnAdjust('p_5g', '0');
			OnAdjust('c_5g', '0');
		} else if (bandSup == '5g') {
			$("#power__adjust_2g__enable,#channel__adjust_2g__enable").remove("checked");
			OnAdjust('p_2g', '0');
			OnAdjust('c_2g', '0');
		}
	});
	
	setTime();
	checkImme();
}

function checkImme() {
	cgicall('RDS.CheckImmePower("")', function(d) {
		if (d.status == "1") { //1 按钮不可点
			$('#power_effect,#power_submit').attr('disabled', true).attr('title', d.msg);
		} else {
			$('#power_effect,#power_submit').attr('disabled', false).attr('title', '');
		}
	});
	
	cgicall('RDS.CheckImmeChannel("")', function(d) {
		if (d.status == "1") {
			$('#channel_effect,#channel_submit').attr('disabled', true).attr('title', d.msg);
		} else {
			$('#channel_effect,#channel_submit').attr('disabled', false).attr('title', '');
		}
	});
}

function adjustEnable(obj) {
	OnAdjust('p_2g', obj.power.adjust_2g.enable);
	OnAdjust('p_5g', obj.power.adjust_5g.enable);
	OnAdjust('c_2g', obj.channel.adjust_2g.enable);
	OnAdjust('c_5g', obj.channel.adjust_5g.enable);
}

function OnAdjust(that, n) {
	if (n == '1') {
		$('.' + that).find('input').attr("disabled", false);
	} else {
		$('.' + that).find('input').attr("disabled", true);
	}
}

function OnSelectAll(){
	dtSelectAll(oTableApList);
}

function initEvent() {
	$('.checkall').on('click', OnSelectAll);
	$('#power__adjust_2g__enable,#power__adjust_5g__enable,#channel__adjust_2g__enable,#channel__adjust_5g__enable').on('click', function() {
		var num;
		$(this).attr('checked') == 'checked' ? num = '1' : num = '0';
		OnAdjust($(this).attr('class'), num);
	})
	
	$('#power_effect').on('click', function() {
		power_channel = "power_submit";
		openDiagAps();
	});
	$('#channel_effect').on('click', function() {
		power_channel = "channel_submit";
		openDiagAps();
	});
	
	$('#power_submit,#channel_submit').on('click', function(){
		saveSubmit($(this).attr('id'));
	})
}

function cloneObj(myObj) { 
	if (typeof(myObj) != 'object') return myObj; 
	if (myObj == null) return myObj; 
	var myNewObj = new Object(); 
	for(var i in myObj) 
		myNewObj[i] = cloneObj(myObj[i]); 
	return myNewObj; 
}