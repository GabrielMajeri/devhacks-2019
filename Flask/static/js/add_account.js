var form = document.getElementById("card_info");
var span = document.getElementsByClassName("closeButton")[0];

function add_account(){
  form.style.display = "block";
}


span.onclick = function(){

  form.style.display = "none";
}
