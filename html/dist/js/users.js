function getUserId(){return location.hash.replace(/^[#!\/]*/g,"")}function getBlankUser(){return{id:"",name:"",email:"",permLevel:20,changePass1:"",changePass2:""}}"/users/"!=location.pathname&&(location.pathname="/users/");var usersApp=new Vue({el:"#users-app",data:{loader:!0,query:"",users:[],me:{},object:getBlankUser(),objectHash:!1,changingPassword:!1,changePass1:null,changePass2:null,userLevels:{1:"Owner",10:"Admin",20:"Member"},timeouts:{}},created:function(){var vm=this;vm.loadIndex(),vm.loadObject(),$.get("/profile",function(result){vm.me=$.extend(vm.me,json_decode(AES.decrypt(result))),vm.me.permLevel=parseInt(vm.me.permLevel),vm.$forceUpdate()})},computed:{hasChanged:function(){return this.objectHash!==md5(json_encode(this.object))},passwordChange:function(){return this.changePass1.length>0&&this.changePass2.length>0},passwordVerify:function(){return 0===this.changePass1.length||this.changePass1.length>12},passwordsMatch:function(){return 0===this.changePass1.length||this.changePass1===this.changePass2},canEdit:function(){if(this.me.id===this.object.id)return!0;switch(this.me.permLevel){case 1:return!0;case 10:return!this.object.id||1!==parseInt(this.object.permLevel);case 20:return!1;default:return!1}},objectIsMe:function(){return this.me&&this.object&&this.me.id===this.object.id}},methods:{clearMessages:function(){this.error=this.success=""},resetObject:function(){this.object=getBlankUser(),this.hasChanged=!1,this.objectHash=md5(json_encode(this.object)),this.changingPassword=!0},loadIndex:function(){var scope=this;$.get({url:"/users",success:function(result){scope.users=json_decode(result),scope.toggleLoader(!1)}})},loadObject:function(){var scope=this;scope.toggleLoader(!0),scope.clearMessages(),scope.cancelChangePassword();var userId=getUserId();return userId.length?void $.get({url:"/users/"+userId,success:function(data){return data?(scope.object=json_decode(data),scope.cancelChangePassword(),scope.objectHash=md5(json_encode(scope.object)),scope.hasChanged=!1,void scope.toggleLoader(!1)):(location.hash="#/",void scope.loadObject())},error:function(jqXHR){return 401==code?void location.reload():(scope.error=jqXHR.responseText,scope.toggleLoader(!1),void scope.resetObject())}}):(scope.toggleLoader(!1),scope.resetObject(),void(scope.changingPassword=!0))},saveObject:function(){var scope=this;if(scope.toggleLoader(!0),scope.clearMessages(),scope.passwordChange){if(!scope.passwordsMatch)return void(scope.error="Passwords do not match.");UserKeychain.setPassword(scope.changePass1),scope.object.passhash=UserKeychain.PassHash,scope.object.contentKeyEncrypted=UserKeychain.getContentKeyEncrypted()}$.post({url:"/users/"+scope.object.id,data:json_encode(scope.object),success:function(result){scope.object=json_decode(result),location.hash="#/"+scope.object.id,scope.loadIndex(),scope.toggleLoader(!1),scope.cancelChangePassword(),scope.objectHash=md5(json_encode(scope.object)),Alerts.success("Successfully saved the user")},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(scope.error=jqXHR.responseText,scope.toggleLoader(!1),void console.log(scope.error))}})},deleteObject:function(){var scope=this;$.ajax({method:"delete",url:"/users/"+scope.object.id,success:function(result){scope.resetObject(),location.hash="#/",scope.loadIndex(),Alerts.success("Successfully deleted the user")},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(scope.error=jqXHR.responseText,void scope.toggleLoader(!1))}})},startChangePassword:function(){this.changePass1="",this.changePass2="",this.changingPassword=!0},cancelChangePassword:function(){this.changePass1="",this.changePass2="",this.changingPassword=!1},toggleLoader:function(toggle){var scope=this;toggle?scope.timeouts.loader=setTimeout(function(){scope.loader=!0},200):(scope.loader=!1,clearTimeout(scope.timeouts.loader),window.scrollTo(0,0))},search:function(id){if(this.query.length<3)return!0;var regexp=new RegExp(this.query.replace(" ",".*"),"i");return null!==this.users[id].name.match(regexp)||null!==this.users[id].email.match(regexp)}}});$(window).on("hashchange",function(){usersApp.loadObject()});