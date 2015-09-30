var oTabAPs,
	oTabNaps,
	oAP,
	ApLogMac,
	nodeEdit,
	clearInitData,
	isFirstFilterURL = true,
	hideColumns = ["7","9"];
	
var edit_radio_2g = {
		'ampdu': '1',
		'amsdu': '1',
		'bandwidth': 'auto',
		'beacon': '100',
		'channel_id': 'auto',
		'dtim': '1',
		'leadcode': '1',
		'power': 'auto',
		'remax': '4',
		'rts': '2347',
		'shortgi': '1',
		'switch': '1',
		'users_limit': '30',
		'wireless_protocol': 'bgn'
	},
	edit_radio_5g = {
		'ampdu': '1',
		'amsdu': '1',
		'bandwidth': 'auto',
		'beacon': '100',
		'channel_id': 'auto',
		'dtim': '1',
		'leadcode': '1',
		'power': 'auto',
		'remax': '4',
		'rts': '2347',
		'shortgi': '1',
		'switch': '1',
		'users_limit': '30',
		'wireless_protocol': 'an'
	};
	
$(document).ready(function() {
	oTabAPs = createDtAPs();
	oTabNaps = createDtNaps();
	initCreateDialog();
	initData();
	initEvent();
});

function createDtAPs() {
	return $('#AP_list').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'asc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": null,
				"sWidth": 80
			},
			{
				"mData": "mac",
				"mRender": function(d, t, f) {
					return "<a href='javascript:;' class='edit' title='编辑' onclick='editAps(\"" + d + "\")'>"+ d +"</a>";
				}
			},
			{
				"mData": "ap_describe"
			},
			{
				"mData": "ip_address"
			},
			{
				"mData": "current_users",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" class="underline" href="onlineuser?filter='+ f.mac +'">' + toSameNum(d, 3) + '</a>';
				}
			},
			{
				"mData": "radio",
				"mRender": function(d, t, f) {
					return '<a class="underline" href="radiostatus?filter='+ f.mac +'">' + d.toUpperCase() + '</a>';
				}
			},
			{
				"mData": "naps",
				"mRender": function(d, t, f) {
					return '<a style="padding:0 5px;" href="javascript:;" onclick="openNaps(\'' + f.mac + '\')">' + toSameNum(ObjCountLength(d), 3) + '</a>';
				}
			},
			{
				"mData": "boot_time"
			},
			{
				"mData": "online_time"
			},
			{
				"mData": "firmware_ver",
				"mRender": function(d, t, f) {
					var str = d;
					var aVer = d.split('.');
					if (aVer && aVer.length > 4) {
						str = aVer[0] + '.' + aVer[4];
					};
					return str;
				}
			},
			{
				"mData": "state",
				"mRender": function(d, t, f) { //状态,online,offline
					var str = '<span style="color:';
					if (d.status == '1') {
						str += 'green;">在线';
					} else if (d.status == '2'){
						str += 'blue;">升级中';
					} else {
						str += 'black;">离线';
					}
					str += "</span>"
					return str;
				}
			},
			{
				"mData": null,
				"choose": false,
				"bSortable": false,
				"sWidth": 80,
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

function createDtNaps() {
	return $('#naps_list').dataTable({
		"bAutoWidth": false,
		"sPaginationType": "full_numbers", //显示分页数字
		"language": {
			"url": '/luci-static/resources/js/black/dataTables.chinese.json'
		},
		"aaSorting": [[3, 'desc']],
		"aoColumns": [
			{
				"mData": "apid",
				"mRender": function(d, t, f) {
					if (f.desc && f.desc != '') {
						return d + '</br><span>' + f.desc + '</span>';
					} else {
						return d;
					}
				}
			},
			{
				"mData": "apid",
				"mRender": function(d, t, f){
					var g2 = f['2g'];
					var g5 = f['5g'];
					if (g2 && !g5) {
						return '2G';
					}
					if (!g2 && g5) {
						return '5G';
					}
					if (g2 && g5) {
						return '2G/5G';
					}
				}
			},
			{
				"mData": "apid",
				"mRender": function(d, t, f){
					var g2 = f['2g'];
					var g5 = f['5g'];
					if (g2 && !g5) {
						var cid1 = f['2g'].channel_id;
						return cid1;
					}
					if (!g2 && g5) {
						var cid2 = f['5g'].channel_id;
						return cid2;
					}
					if (g2 && g5) {
						var cid3 = f['2g'].channel_id;
						var cid4 = f['5g'].channel_id;
						return cid3 + "/" + cid4;
					}
				}
			},
			{
				"mData": "apid",
				"sWidth": 180,
				"mRender": function(d, t, f){
					var g2 = f['2g'],
						g5 = f['5g'],
						str2,
						str5;

					if (g2 && !g5) {
						str2 = '2G (' + g2['rssi'] + 'dBm)';
						
						return '<span style="display:none;">' + g2['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g2['rssi']) + '" text="' + str2 + '"><div class="rssi_tip"></div></div>';
					}
					if (!g2 && g5) {
						str5 = '5G (' + g5['rssi'] + 'dBm)';
						
						return '<span style="display:none;">' + g5['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g5['rssi']) + '" text="' + str5 + '"><div class="rssi_tip"></div></div>';
					}
					if (g2 && g5) {
						str2 = '2G (' + g2['rssi'] + 'dBm)';
						str5 = '5G (' + g5['rssi'] + 'dBm)';
						
						return '<span style="display:none;">' + g2['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g2['rssi']) + '" text="' + str2 + '"><div class="rssi_tip"></div></div>' + '<span style="display:none;">' + g5['rssi'] + '</span>' + '<div class="margin_5g rssi_blocks" value="' + RssiConvert(g5['rssi']) + '" text="' + str5 + '"><div class="rssi_tip"></div></div>';
					}
				}
			}
		],
		"fnDrawCallback": function() {
			$('.rssi_blocks').each(function(index, element) {
				var val = $(element).attr('value'),
					text = $(element).attr('text');

				$(element).progressbar({"value": parseInt(val)});
				$(element).find(".rssi_tip").text(text);
				$(element).find('.ui-progressbar-value').css('background-color', RssiColor(val));
			});
		}
	});
}

function initCreateDialog() {
	$('#restartAP').dialog({
		"title": '重启AP',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 480,
		"height": 220,
		"buttons": [
			{
				"text": "确定",
				"click": function() {
					DoAPsRestart();
					$(this).dialog( "close" );
				}
			},
			{
				"text": "取消",
				"click": function() {
					$(this).dialog("close");
				}
			}
		]
	});
	
	$('#upgradeAP').dialog({
		"title": 'AP固件升级',
		"autoOpen": false,
		"modal": true,
		"width": 480,
		"height": 320,
		"buttons": [
			{
				"text": '开始升级',
				"click": function() {
					DoUpdateFireware();
					$(this).dialog('close');
				}
			},
			{
				"text": '取消',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#editAP').dialog({
		"title": '配置AP参数',
		"autoOpen": false,
		"modal": true,
		"width": 560,
		"height": 480,
		"buttons": [
			{
				"text": '保存',
				"click": function() {
					// if (!verification()) {
						// return;
					// }
					saveConfAp();
					$(this).dialog("close")
				}
			},
			{
				"text": '取消',
				"click": function() {
					$(this).dialog("close")
				}
			}
		]
	});
	
	$('#delAP').dialog({
		"title": '删除不在线的AP',
		"autoOpen": false,
		"modal": true,
		"width": 480,
		"height": 220,
		"buttons": [
			{
				"text": '确认',
				"click": function() {
					DoDeleteAPs();
					$(this).dialog('close');
				}
			},
			{
				"text": '取消',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#resetAP').dialog({
		"title": '恢复出厂AP配置',
		"autoOpen": false,
		"modal": true,
		"width": 480,
		"height": 220,
		"buttons": [
			{
				"text": '确认',
				"click": function() {
					DoAPsReset();
					$(this).dialog('close');
				}
			}, {
				"text": '取消',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#dialog_naps').dialog({
		"title": '邻居AP列表',
		"autoOpen": false,
		"modal": true,
		"width": 560,
		"height": 480,
		"buttons": [
			{
				"text": '关闭',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
	
	$('#hide_column').dialog({
		"title": '显示隐藏列',
		"autoOpen": false,
		"modal": true,
		"width": 480,
		"height": 360,
		"buttons": [
			{
				"text": '保存',
				"click": function() {
					saveHideColumn();
					$(this).dialog('close');
				}
			},
			{
				"text": '取消',
				"click": function() {
					$(this).dialog('close');
				}
			}
		]
	});
}

function setTimeInitData() {
	clearTimeout(clearInitData);
	clearInitData = setTimeout(function(){
		initData();
   	}, 10000);
}

function initData() {
	cgicall("ApmListAPs", function(d) {
		cgicall("GetHideColumns", "webui/hidepage/wireless/apstatus", function(hd) {
			if (d.status == 0) {
				var data = d.data,
					node = oTabAPs.fnGetNodes(),
					harr = hideColumns,
					macNode = {}; //记录选中的mac，mac是唯一标识

				oAP = d.data;
				if (hd.status == 0) {
					if (Object.prototype.toString.call(hd.data) === '[object Array]') {
						hideColumns = hd.data;
						harr = hd.data;
					}
				}

				for (var i = 0; i < node.length; i++) {
					if ($(node[i]).hasClass('row_selected')) {
						var key = $(node[i]).find('td:eq(1) a.edit').html();
						macNode[key] = '1';
					};
				}
				
				dtReloadData(oTabAPs, dtObjToArray(data.APs), true, function() {
					var macKey,
						furl = getRequestFilter(),
						mnode = oTabAPs.fnGetNodes();

					if (furl != "" && isFirstFilterURL) {
						oTabAPs.fnFilter(furl);
						isFirstFilterURL = false;
					}

					//勾选重绘之前选中的checkbox
					for (var n in mnode) {
						macKey = $(mnode[n]).find('td:eq(1) a.edit').html();
						if (macKey in macNode) {
							$(mnode[n]).addClass('row_selected').find('td input[type="checkbox"]').prop('checked', true);
						}
					}
					dtHideColumn(oTabAPs, harr);
				});
				
				setTimeInitData();	
			} else {
				console.log("ApmListAPs error " + (d.data ? d.data : ""));
			}
			
		});
	});

	cgicall("ApmFirewareList", function(d) {
		if (d.status == 0) {
			var strHtml = '';
			for (var i = 0; i < d.length; i++) {
				if (d[i].length == 0) continue;
				strHtml += "</li>" + d[i] + "</li>";
			}
			$('#ul_VerAcFirw').html(strHtml);
		} else {
			console.log("ApmFirewareList error " + (d.data ? d.data : ""));
		}
	});
}

function getRequestFilter() {
	var str,
		restr = "",
		obj = {},
		url = window.location.search;
		
	if (url && url != "") {
		url = url.substring(1);
		str = url.split("&");
		
		for (var i = 0; i < str.length; i ++) {
			obj[str[i].split("=")[0]] = str[i].split("=")[1];
		}
		
		if ("filter" in obj) {
			restr = obj.filter.split("||").join(" ");
		}
	}
	return decodeURI(restr);
}

function saveHideColumn() {
	var obj = {};
	var hidenum = [];
	$('#hide_column ul.ul_cols li').each(function(index, element) {
		if (!$(element).find('input').is(":checked")) {
			hidenum.push($(element).find('input').val());
		}
	});
	obj.page = 'webui/hidepage/wireless/apstatus';
	obj.data = hidenum;
	cgicall('DtHideColumns', obj, function(d) {
		console.log(hidenum)
		if (d.status == 0) {
			hideColumns = hidenum;
			dtHideColumn(oTabAPs, hidenum);
		} else {
			alert("操作失败！" + (d.data ? d.data : ""));
		}
	});
}

function GetSelectedAps(mac) {
	nodeEdit = [];
	if (mac) {
		if (oAP.APs[mac]) {
			nodeEdit.push(oAP.APs[mac]);
		}
	} else {
		nodeEdit = dtGetSelected(oTabAPs);
	}
}

function editAps(mac) {
	if (mac) {
		ApLogMac = mac;
	} else {
		ApLogMac = "";
	}
	GetSelectedAps(mac);
	if (nodeEdit.length < 1) {
		alert('选择要编辑的AP！');
		return;
	} else if (nodeEdit.length > 1) {
		setConfigDefault(nodeEdit[0]); //批量修改 radio配置改成默认值
	}

	set_country_channel(nodeEdit[0]);
	jsonTraversal(nodeEdit[0], jsTravSet);
	OnLanDHCPChg();
	OnWorkMode(nodeEdit[0].edit.work_mode);
	$('.invalid').removeClass('invalid');
	
	var Ulimit2g = $('#edit__radio_2g__users_limit');
	if (Ulimit2g.length > 0) {
		if (Ulimit2g.val() == '' || Ulimit2g.val() == 0) {
			Ulimit2g.val('30');
		}
	}
	var Ulimit5g = $('#edit__radio_5g__users_limit');
	if (Ulimit5g.length > 0) {
		if (Ulimit5g.val() == '' || Ulimit5g.val() == 0) {
			Ulimit5g.val('30');
		}
	}
	
	if (nodeEdit.length > 1) {
		$('.channel_2g_big,.channel_5g_big').css('display', 'block');
		$('.channel_2g_enable,.channel_5g_enable').prop('checked', false).prop('disabled', false);
		$('#edit__radio_2g__channel_id,#edit__radio_5g__channel_id').prop('disabled', true);
	} else {
		$('.channel_2g_big,.channel_5g_big').css('display', 'none');
		$('.channel_2g_enable,.channel_5g_enable').prop('checked', true).prop('disabled', true);
		$('#edit__radio_2g__channel_id,#edit__radio_5g__channel_id').prop('disabled', false);
	}	
	
	$("#editAP").dialog('open');
}

function openNaps(mac) {
	dtReloadData(oTabNaps, oAP.APs[mac].naps);
	$("#dialog_naps").dialog('open');
}

function setConfigDefault(conf) {
	var radio_2g = ObjClone(edit_radio_2g);
	var radio_5g = ObjClone(edit_radio_5g);
	if (typeof(conf['edit']['radio_2g']) != "undefined") {
		conf['edit']['radio_2g'] = radio_2g;
	}
	
	if (typeof(conf['edit']['radio_5g']) != "undefined") {
		conf['edit']['radio_5g'] = radio_5g;
	}
}

//保存配置
function saveConfAp() {
	var macarr = [],
		obj = {},
		ap = checkConfigKey(nodeEdit[0]);

	var apedit = jsonTraversal(ap, jsTravGet);
	
	for (var i = nodeEdit.length - 1; i >= 0; i--) {
		macarr.push(nodeEdit[i].mac);
	};

	obj.edit = apedit.edit;
	obj.aps = macarr;
	
	//工作信道批量
	if (macarr.length > 1) {
		if ($(".channel_2g_enable").is(":checked")) {
			obj.edit.radio_2g.batch_enable = "1";
		} else {
			obj.edit.radio_2g.batch_enable = "0";
		}
		
		if ($(".channel_5g_enable").is(":checked")) {
			obj.edit.radio_5g.batch_enable = "1";
		} else {
			obj.edit.radio_5g.batch_enable = "0";
		}
	}

	cgicall('ApmUpdateAps', obj, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("保存失败！" + (d.data ? d.data : ""));
		}
		$("#editAP").dialog('close');
	});
}

function DoDeleteAPs() {
	var arr = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		arr.push(oAPs[i].mac);
	}
	cgicall('ApmDeleteAps', arr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("删除失败！" + (d.data ? d.data : ""));
		}
	});
}

function DoAPsReset() {
	var arr = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		arr.push(oAPs[i].mac);
	}
	var obj = {};
	obj.cmd = 'rebootErase';
	obj.data = arr;
	cgicall('ApmExecCommands', obj, function(d) {
		if (d.status == 0) {
			initData();
			alert("正在恢复出厂配置，稍后将重新上线...");
		} else {
			alert("恢复出厂配置失败！" + (d.data ? d.data : ""));
		}
	});
}

function DoUpdateFireware() {
	var aAPs = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		aAPs.push(oAPs[i].mac);
	}

	cgicall('ApmUpdateFireware', aAPs, function(d) {
		if (d.status == 0) {
			initData();
			alert("正在升级，稍后将重新上线...");
		} else {
			alert("升级失败！" + (d.data ? d.data : ""));
		}
	});
}

function DoAPsRestart() {
	//获取选择ap列表
	var aAPs = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		aAPs.push(oAPs[i].mac);
	};
	var obj = {};
	obj.cmd = 'rebootAps';
	obj.data = aAPs;
	cgicall('ApmExecCommands', obj, function(d) {
		if (d.status == 0) {
			alert("重启成功，稍后将重新上线...");
			initData();
		} else {
			alert("重启失败！" + (d.data ? d.data : ""));
		}
	});
}

function checkConfigKey(conf) {
	var radio_2g = ObjClone(edit_radio_2g);
	var radio_5g = ObjClone(edit_radio_5g);
	for (var k in radio_2g) {
		if (typeof(conf['edit']['radio_2g']) == "undefined") break;
		if (typeof(conf['edit']['radio_2g'][k]) == "undefined" || conf[k] == '') {
			conf['edit']['radio_2g'][k] = radio_2g[k];
		}
	}
	
	for (var k in radio_5g) {
		if (typeof(conf['edit']['radio_5g']) == "undefined") break;
		if (typeof(conf['edit']['radio_5g'][k]) == "undefined" || conf[k] == '') {
			conf['edit']['radio_5g'][k] = radio_5g[k];
		}
	}
	
	return conf;
}

function set_country_channel(obj) {
	channel_2gSet(obj); //2g 信道带宽option设置
	channel_5gSet(obj);
	country_2gSet(obj); //国家码对应信道
	country_5gSet(obj);
}

function initEvent() {
	//select change
	$('#edit__radio_2g__wireless_protocol').on('change', function() {
		var op = $(this).find('option:selected').val();
		channel_2gSet(op);
	});
	$('#edit__radio_5g__wireless_protocol').on('change', function() {
		var op = $(this).find('option:selected').val();
		channel_5gSet(op);
	});
	$("#edit__radio_2g__bandwidth").on('change', function() {
		var op = $(this).find('option:selected').val();
		country_2gSet(op);
	})
	$("#edit__radio_5g__bandwidth").on('change', function() {
		var op = $(this).find('option:selected').val();
		country_5gSet(op);
	})
	
	$('.restart').on('click', OnRestartNew); //重启AP
	$('.upgrade').on('click', OnUpgradeFireware); //升级AP
	$('.edit').on('click', function() { editAps(); }); //编辑
	$('.downloadaplog').on('click', OnDownloadApLog); //下载AP日志
	$('.resetAPs').on('click', OnResetAPs); //恢复出厂配置
	$('.deleteAPs').on('click', OnDeleteAPs); //删除
	$('#edit__ip_distribute').on('change', OnLanDHCPChg); //DHCP分配
	$('#edit__work_mode').on('change', function() {
		var mode = $(this).find('option:selected').val();
		OnWorkMode(mode);
	}); //工作模式
	$('.btn_col').on('click', OnHideCol);
	$('#btn_exec_cmd').on('click', OnGetApLog);
	$('.channel_2g_enable').on('click', OnChannelEn2);
	$('.channel_5g_enable').on('click', OnChannelEn5);
	$('.checkall').on('click', OnSelectAll); //全选
	
	$("#tabs_APConf, #tabs_RadioConf").tabs();
	$( "#editAP" ).tooltip();
}

function OnRestartNew() {
	GetSelectedAps()
	if (nodeEdit.length < 1) {
		alert('选择要重启的AP！');
		return;
	}
	$("#restartAP").dialog('open');
}

function OnUpgradeFireware() {
	GetSelectedAps();
	if (nodeEdit.length < 1) {
		alert('选择要升级的AP！');
		return;
	}
	$('#upgradeAP').dialog('open');
}

function OnDownloadApLog() {
	GetSelectedAps();
	if (nodeEdit.length < 1) {
		alert('选择要下载日志的AP！');
		return;
	}
	var aAPs = [];
	for (var i = nodeEdit.length - 1; i >= 0; i--) {
		aAPs.push(nodeEdit[i].mac);
	}

	cgicall('DownloadApLog', aAPs, function(d) {
		if (d.status == 0) {
			window.location.href = '/aplog.tar';
		} else {
			alert('下载失败！');
		}	
	});	
}

function OnResetAPs() {
	GetSelectedAps();
	if (nodeEdit.length < 1) {
		alert('选择要恢复的AP！');
		return;
	}
	$('#resetAP').dialog('open');
}

function OnDeleteAPs() {
	GetSelectedAps();
	if (nodeEdit.length < 1) {
		alert('选择要删除的不在线AP！');
		return;
	}
	for (var k in nodeEdit) {
		if (nodeEdit[k].state.status == '1') {
			alert('只能删除离线AP！');
			return;
		}
	}
	$('#delAP').dialog('open');
}

function OnHideCol() {
	$("#hide_column ul li input").each(function(index, element) {
		$(element).prop('checked', true);
		for (var i = 0; i < hideColumns.length; i++) {
			if (hideColumns[i] == $(element).val()) {
				$(element).prop('checked', false);
				break;
			}
		}
	})
	$("#hide_column").dialog('open');
}

function OnGetApLog() {
	if (ApLogMac && ApLogMac != "") {
		GetSelectedAps(ApLogMac);
	} else {
		GetSelectedAps();
	}
	if (nodeEdit.length < 1) {
		return;
	}
	cgicall('GetApLog', nodeEdit[0].mac, function(d) {
		if (d.status == 0) {
			$('#LogRuntime').val(d.data);
		}
	});
}

function OnChannelEn2() {
	if ($('.channel_2g_enable').is(":checked")) {
		$('#edit__radio_2g__channel_id').prop('disabled', false);
	} else {
		$('#edit__radio_2g__channel_id').prop('disabled', true);
	}
}

function OnChannelEn5() {
	if ($('.channel_5g_enable').is(":checked")) {
		$('#edit__radio_5g__channel_id').prop('disabled', false);
	} else {
		$('#edit__radio_5g__channel_id').prop('disabled', true);
	}
}

function OnSelectAll() {
	var that = this;
	dtSelectAll(that, oTabAPs);
}

function OnLanDHCPChg() {
	var en = $('#edit__ip_distribute').val();
	if (en == 'static') {
		en = false;
	} else {
		en = true;
	}
	$('#edit__ip_address,#edit__netmask,#edit__gateway').prop('disabled', en);
	
	//common editor
	if (nodeEdit.length > 1) {
		$('#edit__nick_name,#edit__ip_address,#edit__netmask,#edit__gateway').prop('disabled', true);
	} else {
		$('#edit__nick_name').prop('disabled', false);
	}
}

function OnWorkMode(o) {
	if (o == 'hybrid') {
		$('.mode_hybrid,.mode_normal').show().find('input').prop('disabled', false);
		$('.mode_monitor').hide().find('input').prop('disabled', true);
	} else if (o == 'normal') {
		$('.mode_hybrid,.mode_monitor,.mode_normal').hide().find('input').prop('disabled', true);
	} else if (o == 'monitor') {
		$('.mode_hybrid').hide().find('input').prop('disabled', true);
		$('.mode_monitor,.mode_normal').show().find('input').prop('disabled', false);
	}
}

function channel_2gSet(obj) {
	var op2,
		protocol,
		bol = true,
		pauto = '<option value="auto">auto</option>',
		p20 = '<option value="20">20</option>',
		p40p = '<option value="40+">40+</option>',
		p40m = '<option value="40-">40-</option>',
		band2g = $("#edit__radio_2g__bandwidth");

	if (typeof(obj) == 'object') {
		protocol = obj.edit.radio_2g.wireless_protocol;
		bol = false;
	} else {
		protocol = obj;
	}

	switch (protocol)
	{
		case 'b':
			band2g.html(p20);
			break;
		case 'g':
			band2g.html(p20);
			break;
		case 'n':
			band2g.html(pauto + p20 + p40p + p40m);
			break;
		case 'bg':
			band2g.html(p20);
			break;
		case 'bng':
			band2g.html(pauto + p20 + p40p + p40m);
			break;
		default:
			band2g.html(pauto + p20 + p40p + p40m);
			break;
	}
	
	if (bol) {
		op2 = $("#edit__radio_2g__bandwidth").find('option:selected').val();
		country_2gSet(op2);
	}
}

function channel_5gSet(obj) {
	var op2,
		protocol,
		bol = true,
		pauto = '<option value="auto">auto</option>',
		p20 = '<option value="20">20</option>',
		p40p = '<option value="40+">40+</option>',
		p40m = '<option value="40-">40-</option>',
		band5g = $("#edit__radio_5g__bandwidth");

	if (typeof(obj) == 'object') {
		protocol = obj.edit.radio_5g.wireless_protocol;
		bol = false;
	} else {
		protocol = obj;
	}
	
	switch (protocol)
	{
		case 'a':
			band5g.html(p20);
			break;
		case 'n':
			band5g.html(pauto + p20 + p40p + p40m);
			break;
		case 'an':
			band5g.html(pauto + p20 + p40p + p40m);
			break;
		default:
			band5g.html(pauto + p20 + p40p + p40m);
			break;
	}
	
	if (bol) {
		op2 = $("#edit__radio_5g__bandwidth").find('option:selected').val();
		country_5gSet(op2);
	}
}

function country_2gSet(obj) {
	var str_2g,
		cband,
		ctc_2g = [];
		
	if (typeof(obj) == 'object') {
		cband = obj.edit.radio_2g.bandwidth;
	} else {
		cband = obj;
	}
	ctc_2g = countryToSetChannel(oAP.country, cband, '2g');
	for (var k in ctc_2g) {
		str_2g += '<option>' + ctc_2g[k] + '</option>';
	}
	$("#edit__radio_2g__channel_id").html(str_2g);
}

function country_5gSet(obj) {
	var str_5g,
		cband,
		ctc_5g = [];
	
	if (typeof(obj) == 'object') {
		cband = obj.edit.radio_5g.bandwidth;
	} else {
		cband = obj;
	}
	ctc_5g = countryToSetChannel(oAP.country, cband, '5g');
	for (var k in ctc_5g) {
		str_5g += '<option>' + ctc_5g[k] + '</option>';
	}
	$("#edit__radio_5g__channel_id").html(str_5g);
}

function RssiConvert(d) {
	var num = parseInt(d);
	var per = Math.round((100*num + 11000)/75); //-30信号强度为100%,-110为0%
	if (per < 0) per = 0;
	if (per > 100) per = 100;
	return per;
}

function RssiColor(sRate) {
	var r = 0,
		g = 0,
		b = 0,
		rate = parseInt(sRate);

	b = (100 - rate) * 120 / 100 + 100;
	r = (100 - rate) * 120 / 100 + 100;
	g = rate * 100 / 100 + 200;

	return 'rgb(' + parseInt(r) + ', ' + parseInt(g) + ', ' + parseInt(b) + ')';
}

