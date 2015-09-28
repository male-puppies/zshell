// JavaScript Document
var oTable,
	modify_flag = 0,
	g_user = {
		enable: 1,
		name: '',
		pwd: '',
		desc: '',
		multi: 1,
		bind: '',
		expire: '',
		remain: ''
	};
	
	
$(document).ready(function(){
	oTable = createDtUser();
	initCreateDialog();
	$('#expire_text').datetimepicker({
		lang: 'ch',
		format: 'Y/m/d H:i:00'
	});
	
	initData();
	initEvent();
	
	// verifyEventsInit();                                   	
});

function createDtUser() {
	return $('#user_config').dataTable({
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
				"mData": "name",  
            	"mRender" : function(d, t, f) {
					if(f.desc == ""){
            			return '<a href="javascript:;" class="edit" title="编辑" onclick="edit(this)">' + d + '</a>'
					}
					var str = f.name + '(' + f.desc + ')';
					
            		return '<a href="javascript:;" class="edit" title="编辑" onclick="edit(this)">' + str + '</a>'
            	}
            },
            {
				"mData": "maclist",
            	"mRender": function (d, t, f) {
					var str;
					if (f.bind == "none") {
						str = "无";
					} else {
						if (dtObjToArray(d).length == 0) {
							str = "无";
						} else {
							str = dtObjToArray(d).join("</br>");
						}
					}
					return str;
               }
            },
			{
				"mData": "expire",
				"mRender": function (d, t, f) {
			  		if (d[0] == 0) {
			  			return "永久有效"
			  		} else {
						var data = d[1];
						return data.substring(0,4) + "/" + data.substring(4,6) + "/" + data.substring(6,8) + " " + data.substring(9,11) + ":" + data.substring(11,13) + ":" + data.substring(13);
					}
               }
			},
            {
				"mData": "enable",
				"mRender": function (d, t, f) {
					if (d == 0) {
						return '<a href="javascript:;" class="edit icon-no" title="启用" onclick="set_enable(this)">已禁用</a>';
					} else {
						return '<a href="javascript:;" class="edit icon-ok" title="禁用" onclick="set_enable(this)">已启用</a>';
					}
               }
			},
            {
				"mData": "name",
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

function initCreateDialog() {
	$('#adduser_manage').dialog({
		"title": '添加用户',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 560,
		"height": 480,
		"buttons": [
			{
				"text": "确定",
				"click": function() {
					setData();
					$(this).dialog("close");
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
}

function initData() {
	cgicall("UserGet", function(d) {
		if (d.status == 0) {
			dtReloadData(oTable, dtObjToArray(d.data));
		} else {
			console.log(d.msg ? d.msg : "reload fail");
		}
	})
}

//提交用户数据
function setData(){
	var data = jsonTraversal(g_user, jsTravGet);
	var remain_t1 = $("#remain_t1").val(),
		remain_t2 = $("#remain_t2").val(),
		remain_t3 = $("#remain_t3").val(),
		macval = $("#maclist").val(),
		num = 0;

	if (data.expire == "1") {
		data.expire = [1, $("#expire_text").val().replace(/\//g, "").replace(/\:/g, "")];
	} else {
		data.expire = [0, $("#expire_text").val().replace(/\//g, "").replace(/\:/g, "")];
	}
	
	num = remain_t1*86400 + remain_t2*3600 + remain_t3*60;
	if (data.remain == "1") {
		data.remain = [1, num];
	} else {
		data.remain = [0, num];
	}
	
	if (macval == "") {
		data.maclist = [];
	} else {
		data.maclist = macval.split("\n")
	}

	if (data.expire[1] == "") {
		data.expire[1] = "19700101 000000";
	}

	if (modify_flag == 0) {
		cgicall("UserAdd", data, function(d) {
			if (d.status == 0) {
				initData();
			} else {
				alert("添加失败！" + (d.msg ? d.msg : ""));
			}
		})
	} else {
		cgicall("UserSet", data, function(d) {
			if (d.status == 0) {
				initData();
			} else {
				alert("修改失败！" + (d.msg ? d.msg : ""));
			}
		})
	}
	$('#adduser_manage').dialog('close');	
}

function edit(that){
	var node,
		obj = {},
		expire0,
		expire1,
		remain0,
		remain1;

	$("#name").prop("disabled", true);
	modify_flag = 1
	node = $(that).closest("tr");
	obj = oTable.fnGetData(node);

	jsonTraversal(obj, jsTravSet);
	expire0 = (obj.expire)[0];
	expire1 = (obj.expire)[1];
	remain0 = (obj.remain)[0];
	remain1 = (obj.remain)[1];
	
	if (expire0 == "1") {
		$("#expire").get(0).checked = true;
	} else {
		$("#expire").get(0).checked = false;
	}
	$("#expire_text").val(expire1.substring(0,4) + "/" + expire1.substring(4,6) + "/" + expire1.substring(6,8) + " " + expire1.substring(9,11) + ":" + expire1.substring(11,13) + ":" + expire1.substring(13,15));
	
	if (remain0 == "1") {
		$("#remain").get(0).checked = true;
	} else {
		$("#remain").get(0).checked = false;
	}
	var timearr = [Math.floor(parseInt(remain1)/86400), Math.floor((parseInt(remain1)%86400)/3600), Math.floor((parseInt(remain1)%3600)/60)];
	$("#remain_t1").val(timearr[0]);
	$("#remain_t2").val(timearr[1]);
	$("#remain_t3").val(timearr[2]);

	$("#maclist").val(dtObjToArray(obj.maclist).join("\n"));

	OnBindmac();
	OnExpire();
	OnRemain();
	$('#adduser_manage').dialog('open');
}


function set_enable(that) {
	var node = $(that).closest("tr");
	var obj = oTable.fnGetData(node);
	
	if (obj.enable == 1) {
		obj.enable = 0;
	} else {
		obj.enable = 1;
	}
	
	cgicall("UserSet", obj, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("修改失败！" + (d.msg ? d.msg : ""));
		}
	})
}

function initEvent() {
	$(".add").on("click", OnAddUser);
	$(".delete").on("click", OnDelopt);
	$('.checkall').on('click', OnSelectAll);
	$("#bind").on("click", OnBindmac);
	$("#expire").on("click", OnExpire);
	$("#remain").on("click", OnRemain);
	
	$("#adduser_manage").tooltip();
}

function OnAddUser(){
	modify_flag = 0;
	$("#name").prop("disabled", false);
	$("#enable").prop("checked", true);
	$(".empty").val("");
	
	$('#expire, #multi, #bind, #remain').prop("checked", false);
	OnBindmac();
	OnExpire();
	OnRemain();
	$('#adduser_manage').dialog('open');
}

function OnDelopt(){
	var namearr = [],
		delarr = dtGetSelected(oTable);

	if (delarr.length == 0) {
		alert("请选择要删除的列表！");
		return;
	}
	
	if (!confirm("确认要删除？")) return;
	
	for (var i = 0; i < delarr.length; i++) {
		namearr.push(delarr[i].name);
	}
	
	cgicall("UserDel", namearr, function(d) {
		if (d.status == 0) {
			initData();
		} else {
			alert("删除失败！" + (d.msg ? d.msg : ""));
		}
	});
}

function OnSelectAll() {
	var that = this;
	dtSelectAll(that, oTable);
}

function OnBindmac() {
	if ($("#bind").is(":checked")) {
		$("#maclist").prop("disabled", false);
	} else {
		$("#maclist").prop("disabled", true);
	}
}

function OnExpire()  {
	if ($("#expire").is(":checked")) {
		$("#expire_text").prop("disabled", false);
	} else {
		$("#expire_text").prop("disabled", true);
	}
}

function OnRemain() {
	if ($("#remain").is(":checked")) {
		$("#remain_t1,#remain_t2,#remain_t3").prop("disabled", false);
	} else {
		$("#remain_t1,#remain_t2,#remain_t3").prop("disabled", true);
	}
}
