function getLockerId(){return location.hash.replace(/^[#!\/]*/g,"")}function getBlankLocker(){return{id:"",name:"",note:"",items:[getBlankItem()]}}function getBlankItem(){return{_id:unique_id(),icon:"fa-key",title:"",url:"",user:"",pass:"",note:""}}"/locker/"!=location.pathname&&(location.pathname="/locker/");var lockerApp=new Vue({el:"#locker-app",data:{loader:!0,success:"",error:"",warning:"",objectHash:!1,object:getBlankLocker(),mergeNeeded:!1,icons:["fa-key","fa-terminal","fa-database","fa-lock","fa-rocket","fa-truck","fa-envelope-square","fa-book","fa-heartbeat","fa-certificate","fa-expeditedssl","fa-slack","fa-wordpress","fa-linux","fa-apple","fa-android","fa-amazon","fa-windows","fa-instagram","fa-dropbox","fa-google-plus-square","fa-facebook-square","fa-twitter","fa-yelp","fa-ban"],timeouts:{},durations:{loadIndex:3e4,checkForChanges:6e4},query:"",index:{}},created:function(){var self=this;self.loadIndex(),self.loadObject(),self.timeouts.loadIndex=setInterval(self.loadIndex,self.durations.loadIndex),self.timeouts.checkForChanges=setInterval(self.checkForChanges,self.durations.checkForChanges)},computed:{hasChanged:function(){return this.objectHash!==this.hashObject(this.object)}},methods:{clearMessages:function(){this.warning=this.error=this.success=""},hashObject:function(obj){return md5(json_encode(obj))},resetObject:function(){this.object=getBlankLocker(),this.objectHash=this.hashObject(this.object)},addItem:function(){this.object.items||(this.object.items=[]),this.object.items.push(getBlankItem())},removeItem:function(key){this.object.items.splice(key,1)},sortItemUpdate:function(event){this.object.items.splice(event.newIndex,0,this.object.items.splice(event.oldIndex,1)[0])},highlight:function(e){setTimeout(function(){$(e.target).select()},10)},getObjectFromResponse:function(obj){return"string"==typeof obj&&(obj=json_decode(obj)),void 0!==obj.items.iv&&(obj.items=AES.decryptToUtf8(obj.items)),"string"==typeof obj.items&&(obj.items=json_decode(obj.items)),obj.items&&obj.items.map&&obj.items.map(function(item){void 0===item._id&&(delete item.$$hashKey,item._id=unique_id()),item.icon=item.icon&&item.icon.length?item.icon:"fa-key"}),obj},setObject:function(obj){obj=this.getObjectFromResponse(obj),this.objectHash=this.hashObject(obj),this.object=obj},loadIndex:function(){var self=this;$.get({url:"/locker/_index",success:function(result){self.index=json_decode(result)},error:function(jqXHR){console.log(jqXHR),self.error=jqXHR.responseText,401===jqXHR.status&&window.logout()}})},loadObject:function(){var self=this;self.toggleLoader(!0),self.clearMessages();var lockerId=getLockerId();return lockerId.length?void $.ajax({method:"get",url:"/locker/"+lockerId,success:function(result){console.log(result),"null"===result?self.warning="Object Not Found.":self.setObject(result),self.toggleLoader(!1)},error:function(jqXHR){return 401==code?void location.reload():(self.error=jqXHR.responseText,self.toggleLoader(!1),void self.resetObject())}}):(self.toggleLoader(!1),void self.resetObject())},checkForChanges:function(callback){var lockerId=getLockerId(),self=this;return lockerId.length?void $.ajax({method:"get",url:"/locker/"+lockerId,success:function(result){result=self.getObjectFromResponse(result),self.hasChanged?self.objectHash!==self.hashObject(result)&&(self.warning="This Locker has changed since it was loaded.",self.mergeNeeded=!0):self.setObject(result),runCallback(callback)},error:function(jqXHR){return 401==code?void location.reload():void(self.error=jqXHR.responseText)}}):void runCallback(callback)},mergeObject:function(callback){function _find_item_key(_id,items){for(var i in items)if(items[i]._id===_id)return i;return!1}function _hash_item(item){delete item.$$hashKey;var hash=self.hashObject(item);return hash}var self=this;self.toggleLoader(!0),self.clearMessages();var lockerId=getLockerId();return lockerId.length?(clearInterval(self.timeouts.checkForChanges),void $.ajax({method:"get",url:"/locker/"+lockerId,success:function(result){var localObj=clone(self.object),remoteObj=self.getObjectFromResponse(result);if(self.hashObject(remoteObj)!==self.objectHash){for(var i in remoteObj.items){var item=remoteObj.items[i],local_item_key=_find_item_key(item._id,localObj.items);local_item_key===!1?localObj.items.push(item):_hash_item(localObj.items[local_item_key])!==_hash_item(item)&&localObj.items.splice(local_item_key,0,item)}localObj.note.trim()!==remoteObj.note.trim()&&(localObj.note+="\n====================MERGE====================\n"+remoteObj.note),self.object=localObj,self.objectHash=self.hashObject(remoteObj)}self.mergeNeeded=!1,self.toggleLoader(!1),self.timeouts.checkForChanges=setInterval(self.checkForChanges,self.durations.checkForChanges),runCallback(callback)},error:function(jqXHR){return 401==code?void location.reload():(self.error=jqXHR.responseText,self.toggleLoader(!1),self.timeouts.checkForChanges=setInterval(self.checkForChanges,self.durations.checkForChanges),void runCallback(callback))}})):(self.toggleLoader(!1),void runCallback(callback))},saveObject:function(){var self=this;self.mergeObject(function(){self.toggleLoader(!0),self.clearMessages();var ajaxData=$.extend(!0,clone(self.object),{items:AES.encrypt(json_encode(self.object.items))});console.log(ajaxData),$.ajax({method:"post",url:"/locker/"+self.object.id,data:json_encode(ajaxData),success:function(result){self.setObject(result),location.hash="#/"+self.object.id,self.loadIndex(),self.toggleLoader(!1),self.success="Successfully saved the object"},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(self.error=jqXHR.responseText,void self.toggleLoader(!1))}})})},deleteObject:function(){var self=this;self.toggleLoader(!0),self.clearMessages(),$.ajax({method:"delete",url:"/locker/"+self.object.id,success:function(result){self.success=result,self.resetObject(),self.loadIndex(),self.toggleLoader(!1)},error:function(jqXHR){return 401==jqXHR.status?void location.reload():(self.error=data,void self.toggleLoader(!1))}})},toggleLoader:function(toggle){var self=this;toggle?self.timeouts.loader=setTimeout(function(){self.loader=!0},200):(self.loader=!1,clearTimeout(self.timeouts.loader),window.scrollTo(0,0))},generatePassword:function(index){var self=this;if(self.object.items&&self.object.items[index]){for(var chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*_-?",pass="",i=0;i<16;i++){var key=Math.floor(Math.random()*chars.length);pass+=chars[key]}self.object.items[index].pass=pass}},search:function(id){if(this.query&&this.query.length<3)return!0;var regexp=new RegExp(this.query.replace(" ",".*"),"i");return null!==this.index[id].name.match(regexp)||(void 0!==this.index[id].items.iv&&(this.index[id].items=AES.decryptToUtf8(this.index[id].items)),null!==this.index[id].items.match(regexp))},fieldMatch:function(value){if(void 0===value||!this.query||!this.query.length)return!1;var regexp=new RegExp(this.query.replace(" ",".*"),"i");return null!==value.match(regexp)}}});$(document).on("keyup",function(e){if(!e.target.value)switch(e.keyCode){case 27:document.activeElement&&document.activeElement.blur();break;case 191:$("#search").focus()}}),$(document).on("keyup","#search",function(e){if(13===e.keyCode){var hash=$(".nav-sidebar").eq(1).find("a[href]:visible").attr("href");hash&&hash.length>3&&(location.hash=hash)}}),$(window).on("hashchange",function(){lockerApp.loadObject()});