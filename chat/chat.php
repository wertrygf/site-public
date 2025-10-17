<?
if(!isset($_SESSION)) session_start();

$msg = "<p>名前と文章を入力して送信ボタンを押してください。</p>";

// チャット内容の取得
$_chat = array();
$rst = mysql_query("select * from chat order by date desc limit 30");
while($col=mysql_fetch_assoc($rst)) $_chat[$col["chid"]] = $col;
mysql_free_result($rst);

// 直近のIDをセッションに登録
$_SESSION["max_chid"] = count($_chat) ? max(array_keys($_chat)) : 0 ;

// 本人を特定するＩＤ
$id = isset($_COOKIE["id"]) ? $_COOKIE["id"] : 0 ;
if(!$id) setcookie("id",md5(rand()),time()+10*365*24*60*60,"/","systemexpress.co.jp");

// 名前 クッキーがあればクッキーをポストされればポストを
$name = isset($_COOKIE["name"]) ? $_COOKIE["name"] : "" ;
$name = isset($_POST["name"]) ? $_POST["name"] : $name ;

chat.html
<?=$msg?>

<form onsubmit="sendChatData();return false">
<table summary="送信フォーム">
<tr><th style="width:150px">名前(10文字以内)</th><td><input type="text" name="name" value="<?=@$name?>" style="width:100%" maxlength="10" required /></td></tr>
<tr><th>文章(50文字以内)</th><td><input type="text" name="text" value="" style="width:100%" maxlength="50" required /></td></tr>
</table>
<p><input type="submit" value="送信" class="button" /></p>
</form>

<table summary="チャット" id="chat">
<tr id="thead"><th style="width:150px">名前</th><th style="width:180px">投稿日時</th><th>文章</th></tr>
<tbody id="board">
<?foreach($_chat as $val){?>
<tr class="chat<?=$val["id"]?>"><td><?=htmlspecialchars($val["name"])?></td><td><?=substr($val["date"],5,14)?></td><td><?=htmlspecialchars($val["text"])?></td></tr>
<?}?>
</tbody>
</table>

<script type="text/javascript">

// 名前か文章にカーソルをフォーカス
if(document.getElementsByName("text")[0]) document.getElementsByName("text")[0].focus();
if(document.getElementsByName("name")[0]) document.getElementsByName("name")[0].focus();

// xmlHttpObjectの作成
function createXMLHttpRequest(){
	var xmlHttpObject = null;
	if(window.XMLHttpRequest){
		xmlHttpObject = new XMLHttpRequest();
	}else if(window.ActiveXObject){
		try{
			xmlHttpObject = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try{
				xmlHttpObject = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){
				return null;
			}
		}
	}
	return xmlHttpObject;
}

// チャットの内容の取得
function loadChatData(){
	xmlHttpObject = createXMLHttpRequest();
	xmlHttpObject.onreadystatechange = displayHtml;
	xmlHttpObject.open("GET","/loadChatData.php",true);
	xmlHttpObject.send(null);
}

// 新たな書き込みがあった場合に表示する
function displayHtml(){
	if((xmlHttpObject.readyState == 4) && (xmlHttpObject.status == 200) && xmlHttpObject.responseText){
		document.getElementById("board").innerHTML = xmlHttpObject.responseText + document.getElementById("board").innerHTML;
	}
}

// チャットに書き込みをする
function sendChatData(){
	xmlHttpObject = createXMLHttpRequest();
	xmlHttpObject.open("POST","/sendChatData.php",true);
	xmlHttpObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xmlHttpObject.send("name="+encodeURIComponent(document.getElementsByName("name")[0].value)+"&text="+encodeURIComponent(document.getElementsByName("text")[0].value));
	document.getElementsByName("text")[0].value = "";
	loadChatData();
}

// 1秒ごとにチャットの内容を取りに行く
setInterval('loadChatData()',1000);

</script>

<style>
table#chat{
	background-color:#8dabd8;
	padding:0 1% 10px;
}
table#chat tr#thead{
	display:none;
}
table#chat td{
	display:block;
	border:none;
	float:left;
	padding:10px;
}
table#chat td:nth-of-type(1){
	font-weight:bold;
	font-size:13px;
	padding-bottom:0;
}
table#chat td:nth-of-type(2){
	color:#333333;
	font-size:13px;
	padding-bottom:0;
}
table#chat td:nth-of-type(3){
	clear:both;
	width:80%;
	background-color:white;
	border-radius:20px;
}
<?// 本人の書き込みを右詰にする
if(@$id){?>
table#chat tr.chat<?=$id?> td{
	float:right;
}
table#chat tr.chat<?=$id?> td:nth-of-type(3){
	background-color:#6fe67a;
}
<?}?>
</style>
