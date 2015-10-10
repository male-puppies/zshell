var oTabWlan,
	oTabAps,
	opr = 'add',
	modify_wlanid = "00001",
	oSSID = {
		'enable': "1",
		'band': 'all',
		'SSID': 'SSID',
		'encrypt': 'none',
		'password':'',
		'hide': "0"
	};

//页面加载初始化
$(document).ready(function() {
	oTabWlan = createDtWlan();
	oTabAps = createDtAps();
	initCreateDialog();
	initData();
	initEvent();
	verifyEventsInit();
})

function createDtWlan() {
	return $('#Wlan_config').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": null
			},
			{
				"mData": "SSID",
				"mRender": function(d, t, f){
					return '<a href="javascript:;" onclick="set_edit(this)" title="编辑">' + d + '</a>';
				}
			},
			{
				"mData": "band",
				"visible": false,
				"mRender": function(d, t, f) {
					if (d === "2g") {
						return "2G";
					} else if (d === "5g") {
						return "5G";
					} else {
						return "双频";
					}
				}
			},
			{
				"mData": "encrypt"
			},
			{
				"mData": "checkAps",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" href="javascript:;" onclick="OpenCheckAps(this);">' + toSameNum(d, 3) + '</a>';
				}
			},
			{ 
				"mData": "enable",
				"mRender": function(d, t, f){
					if (d == 0) {
						return '<a href="javascript:;" class="edit icon-no" title="启用" onclick="set_enable(this)">已禁用</a>';
					} else {
						return '<a href="javascript:;" class="edit icon-ok" title="禁用" onclick="set_enable(this)">已启用</a>';
					}
				}
			},
			{ 
				"mData": "SSID",
				"bSortable": false,
				"mRender": function() {
					return '<input type="checkbox" value="1 0" />';
				}
			}
		],
		"fnRowCallback": dtBindRowSelectEvents,
		"fnDrawCallback": function() {
			this.api().column(0).nodes().each(function(cell, i) {
				cell.innerHTML = i + 1;
			});
		}
	});
}

function createDtAps() {
	return $('#effect_ap').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[0, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": "apid",
				"mRender" : function(d, t, f) {
					return '<span value="' + d + '">' + d + (f.ap_des ? ' (' + f.ap_des + ')' : '') + '</span>';
				}
			},
			{ 
				"mData": "check",
				"bSortable": false,
				"mRender": function(d, t, f) {
					if (d == "1") {
						return '<input type="checkbox" checked="checked" value="1 0" />';
					} else {
						return '<input type="checkbox" value="1 0" />';
					}
				}
			}
		],
		"fnRowCallback": dtBindRowSelectEvents,
		"fnDrawCallback": function() {
			$('.efaps_all input').prop("checked", true);
			$('.efaps_oth input').prop("checked", false);
			this.$('td:eq(1)', {}).each(function(index, element) {
				if ($(element).find('input').is(":checked")) {
					$(element).parent("tr").addClass("row_selected");
				} else {
					$(element).parent("tr").removeClass("row_selected");
					if (opr != 'add') {
						$('.efaps_all input').prop("checked", false);
						$('.efaps_oth input').prop("checked", true);
					}
				}
			});
		}
	})
}

function initCreateDialog() {
	$('#addConfig').dialog({
		"title": 'WLAN管理',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
    	"width": 560,
		"height": 460,
		"buttons": [
			{
				"text": '保存配置',
				"click": function() {
					submitConfig();
				}
			},
			{
				"text": '取消',
				"click": function(){
					$(this).dialog('close');	
				}
			}
		]	
	});	

	$('#effectAps').dialog({
		"title": 'WLAN管理',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
    	"width": 560,
		"height": 460,
		"buttons": [
			{
				"text": '确定',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#checkAps').dialog({
		"title": '生效AP',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
    	"width": 480,
		"height": 360,
		"buttons": [
			{
				"text": '关闭',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
}

//显示选中的AP列表
function OpenCheckAps(that) {
	var node,
		obj,
		sobj;

	node = $(that).closest("tr");
	obj = oTabWlan.fnGetData(node);
	sobj = {
		"SSID": obj["SSID"],
		"ext_wlanid": obj["ext_wlanid"]
	}

	cgicall('WLANListAps', sobj, function(d) {
		if (d.status == 0) {
			var arr = [],
				data = dtObjToArray(d.data)

			for (var i = 0; i < data.length; i++) {
				if (data[i].check == '1') {
					arr.push('<li>' + data[i].apid + ' (' + (data[i].ap_des ? data[i].ap_des : "") + ')</li>');
				}
			}

			$('#checkAps .ul-checkAps').html(arr.join(""));
			$("#checkAps").dialog("open");
		}
	});
}

function initData() {
	cgicall('WLANList', function(d) {
		if (d.status == 0) {
			dtReloadData(oTabWlan, dtObjToArray(d.data), true);
		} else {
			console.log("WLANList error" + (d.data ? d.data : ""));
		}
	});
}

function set_edit(that) {
	var node,
		obj = {};

	opr = 'edit';
	node = $(that).closest("tr");
	obj = oTabWlan.fnGetData(node);
	jsonTraversal(obj, jsTravSet);
	OnEncryptChanged();
	//OnVlanChanged();
	set_wlanListAps(obj);
}

function set_wlanListAps(wlan){
	var obj = {
			"SSID": "",
			"ext_wlanid": ""
		}

	if (wlan && typeof wlan == "object") {
		obj.SSID = wlan["SSID"];
		obj.ext_wlanid = wlan["ext_wlanid"];
		modify_wlanid = wlan["ext_wlanid"];
	}

	cgicall('WLANListAps', obj, function(d) {
		if (d.status == 0) {
			dtReloadData(oTabAps, dtObjToArray(d.data), false);
			$("#addConfig").dialog('open');
		} else {
			alert("获取AP列表失败！请刷新或稍后重试！");
		}
	})
}

function set_enable(that) {
	var node = $(that).closest("tr");
	var obj = oTabWlan.fnGetData(node);
	
	if (obj.enable == "1") {
		obj.enable = "0";
	} else {
		obj.enable = "1";
	}

	var sobj = {
		"cmd": "setwlan",
		"data": {
			"SSID": obj.SSID,
			"enable": obj.enable,
			"ext_wlanid": obj.ext_wlanid
		}
	}

	cgicall('WLANModify', sobj, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("修改失败！" + (d.data ? d.data : ""));
		}
	});
}

function submitConfig() {
	if (!verification()) return;

	var obj = jsonTraversal(oSSID, jsTravGet);
	var apArr = [];
	var apChecked = oTabAps.fnGetNodes();
	
	if ($('.efaps_all input').is(":checked")) {
		for (var k = apChecked.length - 1; k >= 0; k--) {
			apArr.push($(apChecked[k]).find("td:eq(0) span").attr("value"));
		};
	} else {
		for (var i = apChecked.length - 1; i >= 0; i--) {
			if ($(apChecked[i]).hasClass('row_selected')) {
				apArr.push($(apChecked[i]).find("td:eq(0) span").attr("value"));
			}
		};
	}

	obj.apList = apArr;
	if ('checkAps' in obj) {
		delete obj.checkAps;
	}
	if (opr == 'add') {
		cgicall('WLANAdd', obj, function(d) {
			if (d.status == 0) {
				initData();
				$("#addConfig").dialog('close');
			} else {
				alert("保存失败！" + (d.data ? d.data : ""));
			}
		});
	} else {
		obj["ext_wlanid"] = modify_wlanid;
		var sobj = {
			"cmd": "modify",
			"data": obj
		}

		cgicall('WLANModify', sobj, function(d) {
			if (d.status == 0) {
				initData();
				$("#addConfig").dialog('close');
			} else {
				alert("修改失败！" + (d.data ? d.data : ""));
			}
		});
	}
}

function initEvent(){
	$('.add_wlan').on('click', OnAdd);
	$('.del').on('click', OnDelete);
	$('#encrypt').on('change', OnEncryptChanged);
	$('.efaps_oth').on('click', OnApList);
	$('.checkall').on('click', OnSelectAll);
	$('.checkall2').on('click', OnSelectAll2);
	$("#addConfig").tooltip();
}

function OnAdd() {
	opr = 'add';
	var oSSID = {
		'enable': "1",
		'band': 'all',
		'SSID': '',
		'encrypt': 'none',
		'password':'',
		'hide': "0"
	}
	jsonTraversal(oSSID, jsTravSet);
	OnEncryptChanged();
	set_wlanListAps();
}

function OnDelete() {
	var arr = [],
		sid = dtGetSelected(oTabWlan);

	if (sid.length < 1) {
		alert('选择要删除的SSID！');
		return;
	}
	if (!confirm("确定要删除？")) return;

	for (var i = sid.length - 1; i >= 0; i--) {
		arr.push({"SSID": sid[i].SSID, "ext_wlanid": sid[i].ext_wlanid});
	}

	cgicall('WLANDelete', arr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("删除失败！" + (d.data ? d.data : ""));
		}
	})
}

function OnEncryptChanged() {
	var ent = $('#encrypt').val();
	if (ent == 'none') {
		$('#password').prop('disabled', true);
		$('#password').val('');
	}else{
		$('#password').prop('disabled', false);
	};
}

function OnApList() {
	$(".efaps_all input").prop("checked", false);
	$(".efaps_oth input").prop("checked", true);
	$("#effectAps").dialog('open');
}

function OnSelectAll() {
	var that = this;
	dtSelectAll(that, oTabWlan);
}

function OnSelectAll2() {
	var that = this;
	dtSelectAll(that, oTabAps);
}
