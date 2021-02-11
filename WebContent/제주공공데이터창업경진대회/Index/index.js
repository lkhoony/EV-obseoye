$(function(){

  // ## aside menu open and close ----------------------------------------
  // # aside menu open
  $(".aside_open_btn").on("click",function(){
    $(this).css("display","none");
    $("#aside").animate({
      "width" : "350px"
    },200);
  });

  // # aside menu close
  $(".aside_header_logo_close_btn").on("click",function(){
    $("#aside").animate({
      "width" : "0px",

    },200,function(){
      // $("#map_wrap").css("left","0");
      $(".aside_open_btn").css("display","block");
    });

  });

  // ## aside header search ------------------------------------------------
  // # search focusin
  $("#search_txt").on("focusin",function(){
    $(this).val("");
  });

  // # search focusout
  $("#search_txt").on("focusout",function(){
    $(this).val("충전소 이름 검색");
  });

  // ## change aside contents menu item --------------------------------------------
  // # show aside menu charge info
  $(".aside_contents_menu_charginfo_title").on("click",function(){
    if($(this).hasClass("active")==false){
      $(".aside_contents_menu_otherinfo_title").removeClass("active");
      $(".aside_contents_menu_otherinfo").css("display","none");

      $(this).addClass("active");
      $(".aside_contents_menu_charginfo").css("display","block");
    };
  });

  // # show aside menu other info
  $(".aside_contents_menu_otherinfo_title").on("click",function(){
    if($(this).hasClass("active")==false){
      $(".aside_contents_menu_charginfo_title").removeClass("active");
      $(".aside_contents_menu_charginfo").css("display","none");

      $(this).addClass("active");
      $(".aside_contents_menu_otherinfo").css("display","block");

    }
  });

  // # show aside boxes --------------------------------------------------------
  $("#aside_checkboxes input").on("click",function(){
    var isChecked = $(this).is(":checked");
    var boxClass = "." + $(this).attr("id") + "_box";
    if(isChecked){
      $(boxClass).css("display","block");
    }else{
      $(boxClass).css("display","none");

    }

  });
});

