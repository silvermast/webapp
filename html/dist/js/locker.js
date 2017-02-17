function getLockerId(){return location.hash.replace(/^[#!\/]*/g,"")}function getBlankLocker(){return{id:"",name:"",note:"",items:[getBlankItem()]}}function getBlankItem(){return{_id:unique_id(),icon:"fa-key",title:"",url:"",user:"",pass:"",note:""}}"/locker/"!=location.pathname&&(location.pathname="/locker/");var lockerApp=new Vue({el:"#locker-app",data:{loader:!0,success:"",error:"",objectHash:!1,object:getBlankLocker(),icons:["fa-key","fa-terminal","fa-database","fa-lock","fa-rocket","fa-truck","fa-envelope-square","fa-book","fa-heartbeat","fa-certificate","fa-expeditedssl","fa-slack","fa-wordpress","fa-linux","fa-apple","fa-android","fa-amazon","fa-windows","fa-instagram","fa-dropbox","fa-google-plus-square","fa-facebook-square","fa-twitter","fa-yelp","fa-ban"],timeouts:{},query:"",index:{}},created:function(){var self=this;self.loadIndex(),self.loadObject(),self.timeouts.loadIndex=setInterval(self.loadIndex,3e6)},computed:{hasChanged:function(){return this.objectHash!==md5(json_encode(this.object))}},methods:{clearMessages:function(){this.error=this.success=""},resetObject:function(){this.object=getBlankLocker(),this.objectHash=md5(json_encode(this.object))},addItem:function(){this.object.items||(this.object.items=[]),this.object.items.push(getBlankItem())},removeItem:function(key){this.object.items.splice(key,1)},sortItemUpdate:function(event){this.object.items.splice(event.newIndex,0,this.object.items.splice(event.oldIndex,1)[0])},highlight:function(e){setTimeout(function(){$(e.target).select()},10)},loadIndex:function(){var self=this;$.get({url:"/locker/_index",success:function(result){var decData=AES.decrypt(result);self.index=json_decode(decData)},error:function(jqXHR){console.log(jqXHR),self.error=jqXHR.responseText,401===jqXHR.status&&window.logout()}})},loadObject:function(){var self=this;self.toggleLoader(!0),self.clearMessages();var lockerId=getLockerId();return lockerId.length?void $.ajax({method:"get",url:"/locker/"+lockerId,success:function(data){var decData=AES.decrypt(data),decObj=json_decode(decData);decObj.items&&decObj.items.map&&decObj.items.map(function(item){void 0===item._id&&(delete item.$$hashKey,item._id=unique_id()),item.icon=item.icon&&item.icon.length?item.icon:"fa-key"}),self.object=decObj,self.objectHash=md5(json_encode(self.object)),self.toggleLoader(!1)},error:function(jqXHR){return 401==code?void location.reload():(self.error=jqXHR.responseText,self.toggleLoader(!1),void self.resetObject())}}):(self.toggleLoader(!1),void self.resetObject())},saveObject:function(){var self=this;self.toggleLoader(!0),self.clearMessages();var ajaxData=json_encode(AES.encrypt(self.object));$.ajax({method:"post",url:"/locker/"+self.object.id,data:ajaxData,success:function(result){self.object=json_decode(AES.decrypt(result)),location.hash="#/"+self.object.id,self.loadIndex(),self.toggleLoader(!1),self.objectHash=md5(json_encode(self.object)),self.success="Successfully saved the object"},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(self.error=jqXHR.responseText,void self.toggleLoader(!1))}})},deleteObject:function(){var self=this;self.toggleLoader(!0),self.clearMessages(),$.ajax({method:"delete",url:"/locker/"+self.object.id,success:function(result){self.success=result,self.resetObject(),self.loadIndex(),self.toggleLoader(!1)},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(self.error=data,void self.toggleLoader(!1))}})},toggleLoader:function(toggle){var self=this;toggle?self.timeouts.loader=setTimeout(function(){self.loader=!0},200):(self.loader=!1,clearTimeout(self.timeouts.loader),window.scrollTo(0,0))},generatePassword:function(index){var self=this;if(self.object.items&&self.object.items[index]){for(var chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*_-?",pass="",i=0;i<16;i++){var key=Math.floor(Math.random()*chars.length);pass+=chars[key]}self.object.items[index].pass=pass}},search:function(id){if(this.query.length<3)return!0;var regexp=new RegExp(this.query.replace(" ",".*"),"i");if(null!==this.index[id].name.match(regexp))return!0;if(void 0!==this.index[id].meta)for(var i in this.index[id].meta)if(this.index[id].meta[i].match&&null!==this.index[id].meta[i].match(regexp))return!0;return!1},fieldMatch:function(value){if(void 0===value||!this.query.length)return!1;var regexp=new RegExp(this.query.replace(" ",".*"),"i");return null!==value.match(regexp)}}});$(document).on("keyup",function(e){if(!e.target.value)switch(e.keyCode){case 27:document.activeElement&&document.activeElement.blur();break;case 191:$("#search").focus()}}),$(document).on("keyup","#search",function(e){13===e.keyCode&&$(".nav-sidebar a[href]").eq(1).trigger("click")}),$(window).on("hashchange",function(){lockerApp.loadObject()});