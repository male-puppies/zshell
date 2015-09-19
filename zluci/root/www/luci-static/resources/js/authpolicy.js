
var oTable,	modify_flag = 0; //0添加

$(document).ready(function() {
	oTable = createDtAuth();
	createDialog();
	initData();
	initEvent();
});

function createDtAuth() {
	return $('#authn_strategy').dataTable({
		"bSort": false,
        "bProcessing": false,
        "bAutoWidth": false,
		"sPaginationType": "full_numbers",
		"language": {
			"url": '/luci-static/resources/js/black/dataTables.chinese.json'
		},
		"aaSorting": [[1, 'asc']],
		"aoColumns": [
		    {
				"mData": "name"
			},
			{
				"mData": "name",
				"mRender":function(d, t, f) {
					return '<a class="edit opera_style" title="编辑" onclick="editAuthPolicy(this)">'+ d +'</a>';
				}
			},
            {
				"mData": null,
			  	"mRender": function (d, t, f) {
					var str = '';
					if (f.ip1 != f.ip2) {
						str = f.ip1 + '-' + f.ip2;
					} else {
						str = f.ip1;
					}
           			return  str;
           		}
            },
            {
				"mData": "type",
            	"mRender": function (d, t, f) {
					if (data  ==  1) {
						return 'Web认证';
					} else {
						return '自动认证';
					}
               	}
			},
            {
				"mData": "name",
				"mRender":function(d, t, f) {
					if (d == "default") {
						return "<span title='禁止移动默认策略' style='color:red'>禁止移动</span>"; //"禁止移动默认策略";  
					}
					return "<a href='javascript:;' onclick='rowUpper(this)'>上移</a><a onclick='rowDown(this)'>下移</a>";  
				}
			},
            {
				"mData": "name",
				"sWidth": 60,
				"mRender":function(d, t, f) {
					if (d == "default") {
						return "<a href='javascript:;' title='禁止删除默认策略'>删除</a>"; 
					}
					return "<a href='javascript:;' onclick='delopt(this)' title='删除策略'>删除</a>";
				}
			}
        ],
		"fnDrawCallback": function(oSetting){
			var that = this;
			this.$('td:first-child', {}).each( function (i) {
				that.fnUpdate( i+1, this.parentNode, 0, false, false );
			});
			var aoData = oSetting.aoData;
			if (aoData.length > 0) {
				var firstRow = oTable.fnGetNodes(0);
				var pre_lastRow = oTable.fnGetNodes(aoData.length-2);
				$(firstRow).find('a').attr('title','第一条,不能移动!');
				$(pre_lastRow).find('a').attr('title','不能移动到默认策略的位置!');
			};
		}   
	});
}

function createDialog() {
	$('#add_policy').dialog({
		"title": '认证方式配置',
		"autoOpen": false,
		"modal": true,
		"resizable": true,
		"width": 560,
		"height": 420,
		"buttons": [
			{
				"text": "确定",
				"click": function() {
					setData();
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
}

function initData() {
	cgicall("PolicyGet", function(d) {
		alert('aaa')
	})
}

function initEvent() {
	$('.add').click(ejectWindow);
	$('.checkall').click(checkAll);
	//$('.delete').bind('click',deleteOpt);
	$('.config_ways').click(fnConfigWays);
	$("#allow_tips").on('click',fnTip);
}

function rowUpper(_this){
	var row_name = $(_this).parent().siblings('td:nth-child(2)').text();
	cgicall("Auth.AuthPolicy.swapE(v.AuthPolicyName==%q, (k<c.len-1) && c[k+1].AuthPolicyName==%q && v.AuthPolicyName!=`default`)", row_name, row_name, function(){
		dtPageChange("../../../../../q?cmd=Auth.AuthPolicy")
		oprlog("Authorization", "Move Up Authorization Policy:"+ row_name);	
	})
}

function rowDown(_this){
	var row_name = $(_this).parent().siblings('td:nth-child(2)').text();
	if($(_this).hasClass("icon-gray-rowdown")){
		return;	
	}
	
	cgicall("Auth.AuthPolicy.swapE(v.AuthPolicyName==%q, (k>0) && c[k-1].AuthPolicyName==%q && c[k-1].AuthPolicyName!=`default`)", row_name, row_name, function(){
		dtPageChange("../../../../../q?cmd=Auth.AuthPolicy");
		oprlog("Authorization", "Move Down Authorization Policy:" + row_name);
	});
}

function delopt(_this){
	var del_opt_name = $(_this).parent().siblings('td:nth-child(2)').text();
	if (del_opt_name  == 'default' ) {
		alert("无法删除默认策略!");
		return;
	}
	cgicall("Auth.AuthPolicy.deleteE(v.AuthPolicyName==%q)", del_opt_name, function(){
		dtPageChange("../../../../../q?cmd=Auth.AuthPolicy");
 		oprlog("Authorization", "Delete Authorization Policy:"+del_opt_name);
	});
}

/*编辑策略信息*/
function editAuthPolicy(_this){
	modify_flag = 1;
	getEditContent(_this);
}


function initEditAuthPolicy(getdata){
	getdata = getdata[0];
	$('#certify_policy').val(getdata.AuthPolicyName);
	$('#describ').val(getdata.AuthPolicyDesc);
	$('#anthStrategy_name').val(getdata.AuthPolicyName);
	var _val = '';
	if (getdata.IpRange != null) {
		var len = getdata.IpRange.length;
		for(var i = 0; i<len; i++){
			if (getdata.IpRange[i].Start == getdata.IpRange[i].End) {
				_val += getdata.IpRange[i].Start + '\n';
			} else {
				_val += getdata.IpRange[i].Start + '-' + getdata.IpRange[i].End + '\n';
			}
		}
	}
	$('#scope_application').val(_val);
	(getdata.AuthPolicyName == "default")?$('#scope_application').attr("disabled",true).addClass("disabled"):$('#scope_application').attr("disabled",false).removeClass("disabled");

	
	if(getdata.AuthType == 2){
		$('#auto_config').attr('checked','checked');
		$('.auto_config').attr('disabled',false);
		$('.web_config').attr('disabled',true);
		if (getdata.AutoAuthPolicy.BindType == 1) {//ip
			$('#auto_bind_ip').attr('checked', true);
		} else if (getdata.AutoAuthPolicy.BindType == 2){//mac
			$('#auto_bind_mac').attr('checked', true);
		} else {
			$('#auto_bind_ipmac').attr('checked', true);
		};
		if (getdata.AutoAuthPolicy.AutoAuthType == 0) {//禁止认证新用户
			$('#no_new_autouser').attr('checked', true);
		} else if (getdata.AutoAuthPolicy.AutoAuthType == 3) {//访客模式
			$('#guest').attr('checked', 'checked');
			$('#guest_to_group').val(getdata.AutoAuthPolicy.GroupName)
		} else {//添加到本地组
			$('#auto_add_group').attr('checked', true);
			$('#addTo_localGroup').val(getdata.AutoAuthPolicy.GroupName);
		}
	}else{
		$('#web_config').attr('checked', true);	
		$('.web_config').attr('disabled',false);
		$('.auto_config').attr('disabled',true);

		if ((getdata.WebAuthPolicy.AllowRegist & 1) == 0) {//允许注册新用户
			$('#new_web_user').attr('checked', false);
		} else {
			$('#new_web_user').attr('checked', true);
		};

		if ((getdata.WebAuthPolicy.AllowRegist & 2) == 0) {//允许注册手机用户
			$('#new_phone_user').attr('checked', false);
		} else {
			$('#new_phone_user').attr('checked', true);
		};

		if (getdata.WebAuthPolicy.AllowOnline == 1) {//允许未审核的用户上网
			$('#allow_new_uer_online').attr('checked', true);
		} else {
			$('#allow_new_uer_online').attr('checked', false);
		};

		if (getdata.WebAuthPolicy.BindType == 0 ) {//none
			$('#web_bind_ip').attr('checked', false);
			$('#web_bind_mac').attr('checked', false);
		} else if (getdata.WebAuthPolicy.BindType == 1) {//ip
			$('#web_bind_ip').attr('checked', true);
			$('#web_bind_mac').attr('checked', false);
		} else if (getdata.WebAuthPolicy.BindType == 2) {//mac
			$('#web_bind_ip').attr('checked', false);
			$('#web_bind_mac').attr('checked', true);
		} else {//ip+mac
			$('#web_bind_ip').attr('checked', true);
			$('#web_bind_mac').attr('checked', true);
		};

		if (getdata.WebAuthPolicy.Tips != "") {
			$('#allow_tips').attr('checked', true);
			$('#tips').val(getdata.WebAuthPolicy.Tips);
		} else {
			$('#allow_tips').attr('checked', false);
		};
	};
	$('#add_policy').dialog('open');
}

/*添加用户信息*/
function ejectWindow(){
	modify_flag = 0;
	$('#add_policy').dialog('open');
}

function getEditContent(_this){
	//var pare_td = $(_this).parent();
	var anthStrategy_name = $(_this).html();
	$('#certify_policy').attr("disabled", true);
	cgicall("Auth.AuthPolicy.filterE(v.AuthPolicyName==%q)", anthStrategy_name, initEditAuthPolicy);
}

function fnConfigWays(){
	var	auto_config = document.getElementById('auto_config'),
		web_config = document.getElementById('web_config');
	if(auto_config.checked){
		$('.auto_config').attr('disabled',false);
		$('.web_config').attr('disabled',true);
	}else{
		$('.auto_config').attr('disabled', true);
		$('.web_config').attr('disabled', false);
		fnTip();
	}
}

function fnTip(){
	if($("#allow_tips").attr('checked')){
		$("#tips").attr('disabled',false).removeClass("disabled");	
	}else{
		$("#tips").attr('disabled',true).addClass("disabled");	
	}
}

function setData(){
	if(verification() == false){
		//alert("Please pay attention to the error messages!");
		return;
	};
	var policyname = $('#certify_policy').val(),
		policydesc = $('#describ').val(),
		iprange = $('#scope_application').val(),
		//自动认证选项
		autoauth = $('#auto_config:checked').val(),
		auto_bind_ip = $('#auto_bind_ip:checked').val(),
		auto_bind_mac = $('#auto_bind_mac:checked').val(),
		auto_bind_ipmac = $('#auto_bind_ipmac:checked').val(),
		auto_add_group = $('#auto_add_group:checked').val(),
		addTo_localGroup = $('#addTo_localGroup').val(),
		guest = $('#guest:checked').val(),
		guest_to_group = $('#guest_to_group').val(),
		no_new_autouser = $('#no_new_autouser:checked').val(),

		//web认证选项
		webauth = $('#web_config:checked').val(),
		new_web_user = $('#new_web_user:checked').val(),
		new_phone_user = $('#new_phone_user:checked').val(),
		allow_new_uer_online = $('#allow_new_uer_online:checked').val(),
		web_bind_ip = $('#web_bind_ip:checked').val(),
		web_bind_mac = $('#web_bind_mac:checked').val(),
		allow_tips = $('#allow_tips:checked').val(),
		tips = $('#tips').val(),

		data = {},
		cmd = "";
	data = {"AuthPolicyName": policyname,
			"AuthPolicyDesc": policydesc,
			"Enable": 1
		};  
	var arr = $('#scope_application').val().split('\n');
	data.IpRange = new Array;
	for (var i = 0; i < arr.length; i++) {
		var iprange = arr[i].split('-');
		if (iprange.length == 2) {
			if (iprange[0].length > 0 && iprange[1].length > 0) {
				data.IpRange.push({"Start": iprange[0], "End": iprange[1]});
			}
		} else {//单地址模式
			if (iprange[0].length > 0) {
				data.IpRange.push({"Start": iprange[0], "End": iprange[0]});	
			}
		}
	}

	if (autoauth!=null) {//自动认证
		data.AuthType = 2;
		data.AutoAuthPolicy = {};
		data.AutoAuthPolicy.BindType = auto_bind_ip?1:(auto_bind_mac?2:3);
		data.AutoAuthPolicy.AutoAuthType = no_new_autouser? 0:(auto_add_group?2:3);//0不允许认证，2，自动认证，3，访客模式
		if (data.AutoAuthPolicy.AutoAuthType == 2) {
			data.AutoAuthPolicy.GroupName = addTo_localGroup;
		} else if (data.AutoAuthPolicy.AutoAuthType == 3) {
			data.AutoAuthPolicy.GroupName = guest_to_group;
		} else {
			data.AutoAuthPolicy.GroupName = "";
		}
	} else {//web认证
		data.AuthType = 1;
		data.WebAuthPolicy = {};
		var allownew = 0;
		if (new_web_user) {
			allownew |= 1; //web 注册
		};
		if (new_phone_user) {
			allownew |= 2; //手机号注册
		};
		data.WebAuthPolicy.AllowRegist = allownew;
		data.WebAuthPolicy.AllowOnline = allow_new_uer_online?1:0;
		data.WebAuthPolicy.BindType = web_bind_ip?(web_bind_mac?3:1):(web_bind_mac?2:0);
		data.WebAuthPolicy.Tips = allow_tips? tips:"";
	}
	if (modify_flag == 0) {//add
		fnkeepExistedRecord("Auth.AuthPolicy.mapE(v.AuthPolicyName)", policyname, function(){
			cgicall("Auth.AuthPolicy.insert(0, %q)", data,  function(){
				dtPageChange("../../../../../q?cmd=Auth.AuthPolicy");
				oprlog("Authorization", "Add Authorization Policy:" + policyname);
			});
		});	
	} else {//edit
		var old_policyName = $('#anthStrategy_name').val();
		cgicall("Auth.AuthPolicy.updateE(v.AuthPolicyName==%q, v.set(%q))", old_policyName, data,  function(){dtReload(oTable)});
		oprlog("Authorization", "Edit Authorization Policy:" + old_policyName);
		dtPageChange("../../../../../q?cmd=Auth.AuthPolicy");
	}
	$('#add_policy').dialog('close');

}

/*新增或编辑时初始化用户组*/
function initLocalGroup(groupData) {
	$('.addTo_localGroup').html("");  //先清空选项框里的内容； 
	var len = groupData.length,
		str = "";
	for(var i=0; i<len; i++){
		str +='<option>'+groupData[i]+ '</option>';
	}
	$(str).appendTo($('.addTo_localGroup'));
}
