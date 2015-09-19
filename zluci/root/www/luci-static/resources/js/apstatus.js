// var diagRestart,
	// diagUpgrade,
	// diagEditAP,
	// diagDel,
	// diagNaps,
	// diagRst,
	// diagHideColumn,
	// hideColumns = ["7","9"],
	// oTabAPs,
	// oTabNaps,
	// oTabScan,
	// oTabNeighbor,
	// oAPNodes,
	// oAP,
	// ApLogMac,
	// oldObj,
	// isFirstFilterURL = true, //只执行一次URL过滤
	// clearInitData,
	// aAPNodesEdit = [],
	// aSSIDs = [];
var oTabAPs,
	oTabNaps;
	
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

//页面加载初始化
$(document).ready(function() {
	initCreateDialog();
	$("#tabs_APConf").tabs();
	$("#tabs_RadioConf").tabs();
	oTabAPs = createDtAPs();
	oTabNaps = createDtNaps();
	$( "#editAP" ).tooltip();
	
	// diagHideColumn = createDialogHideColumn();
	// diagRestart = createDialogRestart();
	// diagUpgrade = createDialogUpgradeAP(); //
	// diagEditAP = createDialogEdit();
	// diagDel = createDialogDel();
	// diagRst = createDialogRst(); //恢复出厂配置
	// diagNaps = createDialogNpas();
	// oTabAPs = createDtAPs();
	// oTabNaps = createDtNaps();
	// $("#AP_list_length").append('<input class="btn btn_col" style="margin-left:20px;" type="button" value="数据显示" />');
	// initData();
	// BuildFwList();
	// initEvent();
});

function setTimeInitData() {
	clearTimeout(clearInitData);
	clearInitData = setTimeout(function(){
		initData();
		BuildFwList();
   	}, 10000);
}


function createDtAPs() {
	return $('#AP_list').DataTable({
		// "iDisplayLength": 10,
		// "bProcessing": false,
		// "bSort": true, //排序
		// "sServerMethod": "POST", //默认get
		// "sAjaxDataProp": "", //数据源 如：data.arr
		//"aoColumnDefs": [ { "bSortable": false, "aTargets": [ 6,7 ] }],
		"bAutoWidth": false,
		"sPaginationType": "full_numbers", //显示分页数字
		"language": {
			"url": '/luci-static/resources/js/black/dataTables.chinese.json'
		},
		"aaSorting": [[1, 'asc']],
		"aoColumns": [
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"mRender": function(d, t, f) {
					return 'test';
				}
			},
			{
				"mData": "id",
				"bSortable": false,
				"mRender": function(d, t, f) {
					return 'test';
				}
			}
		]
	});
}

function createDtNaps() {
	return $('#naps_list').dataTable({
		"bAutoWidth": false,
		"sPaginationType": "full_numbers", //显示分页数字
		"language": {
			"url": '/luci-static/resources/js/black/dataTables.chinese.json'
		},
		"aaSorting": [[3, 'asc']],
		"aoColumns": [{
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
						
						return '<span style="display:none;">' + g2['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g2['rssi']) + '" text="' + str2 + '"></div>';
					}
					if (!g2 && g5) {
						str5 = '5G (' + g5['rssi'] + 'dBm)';
						
						return '<span style="display:none;">' + g5['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g5['rssi']) + '" text="' + str5 + '"></div>';
					}
					if (g2 && g5) {
						str2 = '2G (' + g2['rssi'] + 'dBm)';
						str5 = '5G (' + g5['rssi'] + 'dBm)';
						
						return '<span style="display:none;">' + g2['rssi'] + '</span>' + '<div class="rssi_blocks" value="' + RssiConvert(g2['rssi']) + '" text="' + str2 + '"></div>' + '<span style="display:none;">' + g5['rssi'] + '</span>' + '<div class="margin_5g rssi_blocks" value="' + RssiConvert(g5['rssi']) + '" text="' + str5 + '"></div>';
					}
				}
			}
		],
		"fnDrawCallback": function() {
			$('.rssi_blocks').each(function() {
				var rssi = $(this).attr('value');
				var text = $(this).attr('text');
				$(this).progressbar({
					"value": rssi,
					"text": text
				});
				$(this).find('.progressbar-value').css('background-color', RssiColor(rssi));
			});
		}
	});
}

function initCreateDialog() {
	$('#restartAP').dialog({
		"title": '重启AP',
		"autoOpen": true,
		"modal": true,
		"resizable": true,
		"width": 480,
		"height": 220,
		"buttons": [
			{
				"text": "确定",
				"click": function() {
					// DoAPsRestart();
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
					// DoUpdateFireware();
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
		"autoOpen": true,
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
					// saveConfAp();
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
					// DoDeleteAPs();
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
					// DoAPsReset();
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
		"autoOpen": true,
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
		"width": 400,
		"height": 320,
		"buttons": [
			{
				"text": '保存',
				"click": function() {
					// saveHideColumn();
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



function initData(cb) {
	cgicall('RDS.ApmListAPs()', function(d) {
		cgicall('RDS.GetHideColumns("webui/hidepage/wireless/apstatus")', function(dd) {
			oldObj = cloneObj(d);
			oAP = d;
			/*
			if (oAP.EnableFireware == "2" || oAP.EnableFireware == "3") {
				$('.upgrade').css('display', '');
			} else {
				$('.upgrade').css('display', 'none');
			}
			*/
			oAPNodes = d.APs;
			if (!dd || dd == "false") {
				dd = hideColumns;
			} else {
				hideColumns = dd;
			}
			//获取checkbox选项
			var gNodeB = oTabAPs.fnGetNodes();
			var macNodeB = {}; //记录选中的mac，mac是唯一标识
			for (var k in gNodeB) {
				if ($(gNodeB[k]).hasClass('row_selected')) {
					var macKeyB = $(gNodeB[k]).find('td:eq(1) a.opera_style').html();
					macNodeB[macKeyB] = '1';
                };
			}
			//过滤刷新
			dtReloadData(oTabAPs, ObjectToArray(d.APs), true, function() {
				if ($('.dataTables_filter input').val() != '') {
					oTabAPs.fnFilter($('.dataTables_filter input').val());
				} else {
					if (isFirstFilterURL) {
						oTabAPs.fnFilter(GetRequestFilter());
						isFirstFilterURL = false;
					}
				}
				//勾选重绘之前选中的checkbox
				var gNodeA = oTabAPs.fnGetNodes();
				for (var n in gNodeA) {
					var macKeyA = $(gNodeA[n]).find('td:eq(1) a.opera_style').html();
					if (macNodeB[macKeyA]) {
						$(gNodeA[n]).addClass('row_selected').find('td input[type="checkbox"]').attr('checked', true);
					}
				}
			});
			
			$('#AP_list').oDtHideColumn(oTabAPs, dd);
			if (cb) {
				cb();
			};
			setTimeInitData();
		});
	});
	
	// cgicall('RDS.GetBandSupport("")', function(d) {
		// if (d == "2g") {
			// $('#radio_tabs').find('ul.tabs li:eq(0)').addClass('tabs-selected').css('display', 'block');
			// $('#radio_tabs').find('ul.tabs li:eq(1)').removeClass('tabs-selected').css('display', 'none');
			// $('.radio_tabs_2g').parent('.panel').css('display', 'block').find('input,textarea,select').not('#edit__radio_2g__channel_id').attr('disabled', false);
			// $('.radio_tabs_5g').parent('.panel').css('display', 'none').find('input,textarea,select').not('#edit__radio_5g__channel_id').attr('disabled', true);
		// } else if (d == "5g") {
			// $('#radio_tabs').find('ul.tabs li:eq(1)').addClass('tabs-selected').css('display', 'block');
			// $('#radio_tabs').find('ul.tabs li:eq(0)').removeClass('tabs-selected').css('display', 'none');
			// $('.radio_tabs_5g').parent('.panel').css('display', 'block').find('input,textarea,select').not('#edit__radio_5g__channel_id').attr('disabled', false);
			// $('.radio_tabs_2g').parent('.panel').css('display', 'none').find('input,textarea,select').not('#edit__radio_2g__channel_id').attr('disabled', true);
		// } else {
			// $('#radio_tabs').find('ul.tabs li').css('display', 'block');
			// $('.radio_tabs_2g,.radio_tabs_5g').find('input,textarea,select').not('#edit__radio_2g__channel_id,#edit__radio_5g__channel_id').attr('disabled', false);
		// }
	// });
}

function saveHideColumn() {
	var str = {};
	var hidenum = [];
	$('#hide_column ul.ul_cols li').each(function(index, element) {
		if ($(element).find('input').attr("checked") != "checked") {
			hidenum.push($(element).find('input').val());
		}
	});
	str.page = 'webui/hidepage/wireless/apstatus';
	str.data = hidenum;
	cgicall('RDS.DtHideColumns(%j)', str, function(d) {
		hideColumns = hidenum;
		$('#AP_list').oDtHideColumn(oTabAPs, hidenum);
	});
	diagHideColumn.dialog('close');
}

function openNaps(mac) {
	dtReloadData(oTabNaps, oAP.APs[mac].naps, false);
	diagNaps.dialog('open');
}

function GetSelectedAps(id, keep) {
	if (!keep)
		aAPNodesEdit = [];

	if (id) {
		if (oAPNodes[id]) {
			var ap = oAPNodes[id];
			aAPNodesEdit.push(ap);
		}
	} else {
		aAPNodesEdit = dtGetSelected(oTabAPs);
	}
}

function set_edit(id) {
	if (id) {
		ApLogMac = id;
	} else {
		ApLogMac = "";
	}
	GetSelectedAps(id)
	if (aAPNodesEdit.length < 1) {
		alert('选择要编辑的AP！');
		return;
	} else if (aAPNodesEdit.length > 1) {
		setConfigDefault(aAPNodesEdit[0]); //批量修改 radio配置改成默认值
	}

	set_country_channel(aAPNodesEdit[0]);
	jsonTraversal(aAPNodesEdit[0], jsTravSet);
	OnLanDHCPChg();
	onWorkMode(aAPNodesEdit[0].edit.work_mode);
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
	
	if (aAPNodesEdit.length > 1) {
		$('.channel_2g_big,.channel_5g_big').css('display', 'block');
		$('.channel_2g_enable,.channel_5g_enable').attr('checked', false).attr('disabled', false);
		$('#edit__radio_2g__channel_id,#edit__radio_5g__channel_id').attr('disabled', true);
	} else {
		$('.channel_2g_big,.channel_5g_big').css('display', 'none');
		$('.channel_2g_enable,.channel_5g_enable').attr('checked', true).attr('disabled', true);
		$('#edit__radio_2g__channel_id,#edit__radio_5g__channel_id').attr('disabled', false);
	}	
	
	diagEditAP.dialog('open');
}

function set_country_channel(obj) {
	channel_2gSet(obj); //2g 信道带宽option设置
	channel_5gSet(obj);
	country_2gSet(obj); //国家码对应信道
	country_5gSet(obj);
}

function OnRestartNew() {
	GetSelectedAps()
	if (aAPNodesEdit.length < 1) {
		alert('选择要重启的AP！');
		return;
	};
	diagRestart.dialog('open');
}

function OnUpgradeFireware() {
	if (AttachFirewareVer())
		$('#upgradeAP').dialog('open');
}

//页面初始化 加载固件版本
function BuildFwList() {
	cgicall('RDS.ApmFirewareList("")', function(d) {
		var strHtml = '';
		var aList = d;
		for (var i = aList.length - 1; i >= 0; i--) {
			if (aList[i].length == 0) {
				continue;
			};
			strHtml += '<li>' + aList[i] + '</li>';
			/*
			if (i == 0) {
				strHtml += '<li><label><input name="VerAcFirw" value="' + aList[i] + '" type="radio" checked/>' + aList[i] + '</label></li>';
			} else {
				strHtml += '<li><label><input name="VerAcFirw" value="' + aList[i] + '" type="radio"/>' + aList[i] + '</label></li>';
			}
			*/
		};
		$('#ul_VerAcFirw').html(strHtml);
	});
}

function AttachFirewareVer() {
	GetSelectedAps();
	if (aAPNodesEdit.length < 1) {
		alert('选择要升级的AP');
		return false;
	};
	/*
	var oAP = aAPNodesEdit[0];
	var prefix = oAP.firmware_ver.split('.');
	if (prefix.length < 3) {
		alert('请重启！');
		return false;
	};
	
	$('#ul_VerAcFirw').find('input[name="VerAcFirw"]').each(function(i, o) {
		var curr = $(this);
		if (curr.val().search(prefix[0] + '.' + prefix[1] + '.' + prefix[2]) >= 0) {
			curr.attr('checked', 'checked');
			return false;
		} else {
			curr.removeAttr('checked');
		}
	});
	*/
	return true;
}

function OnDownloadApLog() {
	GetSelectedAps();
	if (aAPNodesEdit.length < 1) {
		alert('选择要下载日志的AP');
		return false;
	};
	var aAPs = [];
	for (var i = aAPNodesEdit.length - 1; i >= 0; i--) {
		aAPs.push(aAPNodesEdit[i].mac);
	};

	$.messager.progress({
		'text': '加载中...'
	});
	cgicall('RDS.DownloadApLog(%j)', aAPs, function(d) {
		$.messager.progress('close');
		if (d == '1') {
			window.location.href = '/aplog.tar';
		} else {
			alert('下载失败！');
		}	
	});	
}

function OnResetAPs() {
	GetSelectedAps();
	if (aAPNodesEdit.length < 1) {
		alert('选择要恢复的AP');
		return false;
	};
	$('#resetAP').dialog('open');
}

function OnDeleteAPs() {
	GetSelectedAps();
	if (aAPNodesEdit.length < 1) {
		alert('选择要删除的不在线AP');
		return false;
	};
	for (var k in aAPNodesEdit) {
		if (aAPNodesEdit[k].state.status == '1') {
			alert('只能删除离线AP！');
			return false;
		}
	}
	$('#delAP').dialog('open');
}

function OnLanDHCPChg() {
	var en = $('#edit__ip_distribute').val();
	if (en == 'static') {
		en = false;
	} else {
		en = true;
	}
	$('#edit__ip_address').attr('disabled', en);
	$('#edit__netmask').attr('disabled', en);
	$('#edit__gateway').attr('disabled', en);
	
	//common editor
	if (aAPNodesEdit.length > 1) {
		$('#edit__nick_name').attr('disabled', true);
		$('#edit__ip_address').attr('disabled', true);
		$('#edit__netmask').attr('disabled', true);
		$('#edit__gateway').attr('disabled', true);
	} else {
		$('#edit__nick_name').attr('disabled', false);
	}
}

function onWorkMode(o) {
	if (o == 'hybrid') {
		$('.mode_hybrid,.mode_normal').show().find('input').attr('disabled', false);
		$('.mode_monitor').hide().find('input').attr('disabled', true);
	} else if (o == 'normal') {
		$('.mode_hybrid,.mode_monitor,.mode_normal').hide().find('input').attr('disabled', true);
	} else if (o == 'monitor') {
		$('.mode_hybrid').hide().find('input').attr('disabled', true);
		$('.mode_monitor,.mode_normal').show().find('input').attr('disabled', false);
	}
}

function OnSelectAll(){
	dtSelectAll(oTabAPs);
}

function OnHideCol() {
	$("#hide_column ul li input").each(function(index, element) {
		$(element).attr('checked', true);
		for (var i=0; i<hideColumns.length; i++) {
			if (hideColumns[i] == $(element).val()) {
				$(element).attr('checked', false);
				break;
			}
		}
	})
	diagHideColumn.dialog('open');
}

function OnGetApLog() {
	if (ApLogMac && ApLogMac != "") {
		GetSelectedAps(ApLogMac);
	} else {
		GetSelectedAps();
	}
	GetSelectedAps("keep", true);
	if (aAPNodesEdit.length < 1) {
		return;
	}
	cgicall('RDS.GetApLog(%j)', aAPNodesEdit[0].mac, function(d) {
		$('#LogRuntime').val(d);
	});
}

function OnChannelEn2() {
	if ($('.channel_2g_enable').attr("checked") == "checked") {
		$('#edit__radio_2g__channel_id').attr('disabled', false);
	} else {
		$('#edit__radio_2g__channel_id').attr('disabled', true);
	}
}

function OnChannelEn5() {
	if ($('.channel_5g_enable').attr("checked") == "checked") {
		$('#edit__radio_5g__channel_id').attr('disabled', false);
	} else {
		$('#edit__radio_5g__channel_id').attr('disabled', true);
	}
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
	$('.edit').on('click', function() {set_edit();}); //编辑
	$('.downloadaplog').on('click', OnDownloadApLog); //下载AP日志
	$('.resetAPs').on('click', OnResetAPs); //恢复出厂配置
	$('.deleteAPs').on('click', OnDeleteAPs); //删除
	$('.checkall').on('click', OnSelectAll); //全选
	$('#edit__ip_distribute').on('change', OnLanDHCPChg); //DHCP分配
	$('#edit__work_mode').on('change', function() {
		var mode = $(this).find('option:selected').val();
		onWorkMode(mode);
	}); //工作模式
	$('body').on('click', '.btn_col', OnHideCol);
	$('#btn_exec_cmd').on('click', OnGetApLog);
	$('.channel_2g_enable').on('click', OnChannelEn2);
	$('.channel_5g_enable').on('click', OnChannelEn5);
}

function DoAPsRestart() {
	//获取选择ap列表
	var aAPs = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		aAPs.push(oAPs[i].Name);
	};
	var obj = {};
	obj.cmd = 'rebootAps';
	obj.data = aAPs;
	
	$.messager.progress({
		'text': '重启中，30秒左右重新上线...'
	});
	cgicall('RDS.ApmExecCommands(%j)', obj, function(d) {
		$.messager.progress('close');
		initData();
	});
}

function DoUpdateFireware() {
	var aAPs = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		aAPs.push(oAPs[i].Name);
	};
	/*
	function GetVerAcSelected() {
		var re = '';
		$('#ul_VerAcFirw').find('input[name="VerAcFirw"]').each(function(index, ctl) {
			//alert(a);
			if ($(ctl).attr('checked')) {
				re = $(ctl).attr('value');
			}
		});
		return re;
	}
	
	var fwv = GetVerAcSelected();
	if (!fwv || fwv == '') {
		return;
	};
	var str = {};
	str.mac = aAPs;
	str.fwv = fwv;
	str = JSON.stringify(str);
	*/
	$.messager.progress({
		'text': '升级中...'
	});
	cgicall('RDS.ApmUpdateFireware(%j)', aAPs, function(d) {
		$.messager.progress('close');
		initData();
	});
}


function isNullObjFlag(obj) {
	for(var i in obj){
        if(obj.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
}

function checkConfigKey(conf) {
	var radio_2g = cloneObj(edit_radio_2g);
	var radio_5g = cloneObj(edit_radio_5g);
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

function setConfigDefault(conf) {
	var radio_2g = cloneObj(edit_radio_2g);
	var radio_5g = cloneObj(edit_radio_5g);
	if (typeof(conf['edit']['radio_2g']) != "undefined") {
		conf['edit']['radio_2g'] = radio_2g;
	}
	
	if (typeof(conf['edit']['radio_5g']) != "undefined") {
		conf['edit']['radio_5g'] = radio_5g;
	}
	
}

//保存配置
function saveConfAp() {
	var ap = checkConfigKey(aAPNodesEdit[0]);
	jsonTraversal(ap, jsTravGet);
	var aApIDs = [];
	
	for (var i = aAPNodesEdit.length - 1; i >= 0; i--) {
		aApIDs.push(aAPNodesEdit[i].Name);
	};
	
	var obj = {};
	obj.edit = ap.edit;
	obj.aps = aApIDs;

	$.messager.progress({
		'text': 'Loading...'
	});

	cgicall('RDS.ApmUpdateAps(%j)', obj, function(d) {
		initData();
		$.messager.progress('close');
		diagEditAP.dialog('close');
	});
}

function DoDeleteAPs() {
	var ar = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		ar.push(oAPs[i].mac);
	};
	cgicall('RDS.ApmDeleteAps(%j)', ar, function(d) {
		initData();
	});
}

function DoAPsReset() {
	//获取选择ap列表
	var aAPs = [];
	var oAPs = dtGetSelected(oTabAPs);
	for (var i = oAPs.length - 1; i >= 0; i--) {
		aAPs.push(oAPs[i].Name);
	};
	var obj = {};
	obj.cmd = 'rebootErase';
	obj.data = aAPs;
	$.messager.progress({
		'text': '恢复出厂配置，1分钟左右重新上线...'
	});
	cgicall('RDS.ApmExecCommands(%j)', obj, function(d) {
		$.messager.progress('close');
		initData();
	});
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

function toSameNum(d, n) {
	var num,
		str = d.toString(),
		len = str.length;
	if (len < n) {
		num = parseInt(n) - len;
		for (var i = 0; i < num; i++) {
			str = ' ' + str;
		}
	}
	return str;
}

function cloneObj(myObj) { 
	if (typeof(myObj) != 'object') return myObj; 
	if (myObj == null) return myObj; 
	var myNewObj = new Object(); 
	for(var i in myObj) 
		myNewObj[i] = cloneObj(myObj[i]); 
	return myNewObj; 
}
