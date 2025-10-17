<?

// 本人を特定するＩＤ
$id = isset($_COOKIE["id"]) ? $_COOKIE["id"] : md5(rand()) ;
setcookie("id",$id,time()+10*365*24*60*60,"/","systemexpress.co.jp");

$name = isset($_POST["name"]) ? preg_replace("/^\s+|\s+$/u","",$_POST["name"]) : "" ;
$text = isset($_POST["text"]) ? preg_replace("/^\s+|\s+$/u","",$_POST["text"]) : "" ;

$err = array();
if(!$name) $err[] = "名前 を入力してください";
if(mb_strlen($name)>10) $err[] = "名前 は10文字以内で入力してください";
if(!$text) $err[] = "文章 を入力してください";
if(mb_strlen($text)>50) $err[] = "文章 は50文字以内で入力してください";

// 名前をクッキーに登録
setcookie("name",$name,time()+10*365*24*60*60,"/","systemexpress.co.jp");

if(!count($err)){
	mysql_query("insert into chat set date = now(), name = '".addslashes($name)."', text = '".addslashes($text)."', ip = '".$_SERVER["REMOTE_ADDR"]."', id = '".$id."'");
}else{
	$msg = showerr($err);
}
