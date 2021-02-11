		// # ---------------------------------------------------------------
		// # dataRequest.js : Get XML Data From Servlet 
		// 
		// # chargerArrObj : Object of Busi Array
		// 
		// chargerArrObj = { GN : [{addr : "", csId : "", statNm : "" ,busiId : "", busiCall : "" , lat : "" , lng : "",
		//							statUpdTime : "", useTime : "", slow : [{chgerId : "", stat : "", chgerType : ""}, {},...], rapid : []},...], ...KJ : [{},...] }
	

	    // chargerArrObj.GN : 지엔텔
	    // chargerArrObj.HE : 한국전기차충전서비스
	    // chargerArrObj.JE : 제주전기자동차서비스
	    // chargerArrObj.ME : 환경부
	    // chargerArrObj.CV : 대영채비
	    // chargerArrObj.KT : KT
	    // chargerArrObj.PI : 차지비
	    // chargerArrObj.PW : 파워큐브
	    // chargerArrObj.KJ : 한국전력
    	// # ---------------------------------------------------------------
		
	    var selectedMarker = null; // 클릭된 marker 저장
	    var selectedWindow = null; // 클릭된 infowindow 저장

		// 각 회사별로 객체를 관리하기 위한 객체 
	    // 각각의 key의 value는 array
        var chargerArrObj = {
          GN : [],
          HE : [],
          JE : [],
          ME : [],
          CV : [],
          KT : [],
          PI : [],
          PW : [],
          KJ : []
        }

		// 환경부 데이터 처리를 위한 ajax
        for(var i=1; i<=2; i++){
            $.ajax({
                url : "/jeju/ApiServlet",
                data : { pageNo : i, type : 1}, // pageNo과 type을 request에 바인딩하여 전송
                // # type - 1: 환경부 데이터
                async : false,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                dataType : "xml",
                success : function(data){
              	    getData(data,1,chargerArrObj);
                }
            });
        }
	
     	// 한전 데이터 처리를 위한 ajax
        $.ajax({
      	    url : "/jeju/ApiServlet",
            data : { type : 2}, // type을 request에 바인딩하여 전송
            // # type - 2: 한전 데이터
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType : "xml",
            async : false,
            success : function(data){
          	    getData(data,2,chargerArrObj);
	       }
        });
      	
        // # marker에 대한 설정을 하는 함수 호출
     	setMarker(chargerArrObj);
		
     	
     	// # aside_header_search_list에 event등록 
     	$(document).ready(function() {
     		
     		// # serach_txt에 입력할 때 이벤트 등록
		    $("#search_txt").keyup(function() {
		        var k = $(this).val();
		        $(".aside_header_search_list>.list").css("display","none");
		        var temp = $(".aside_header_search_list>.list>.statNm:contains('" + k + "')");
		        $(temp).parent().css("display","block"); 
		    });
		    
		    // # serach_txt에 focus in 이벤트 등록
		    $("#search_txt").focusin(function(){
		    	$(".aside_header_search_list .list").css("display","block");
		        $(".aside_header_search_list").fadeIn(300);
		    });
		    
		    // # serach_txt에 focus out 이벤트 등록
		    $("#search_txt").focusout(function(event){
		    	$(".aside_header_search_list").fadeOut(300);
		    });
		});
     	
     	// # 현재위치 표시 element(current_location)에 클릭 이벤트 등록
     	$(function(){
     		$("#current_location").on("click",function(){
     			
     			if (navigator.geolocation) {
     			    
     			    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
     			    navigator.geolocation.getCurrentPosition(function(position) {
     			        
     			        var lat = position.coords.latitude, // 위도
     			            lon = position.coords.longitude; // 경도
     			            
     			        var imageSrc = "../image/marker/current_location.png"; // 마커이미지의 주소입니다    
     	    		    var imageSize = new kakao.maps.Size(20, 20); // 마커이미지의 크기입니다
     	    		    var imageOption = {offset: new kakao.maps.Point(10, 20)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
     	    		        
     	    		    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
     	    			
     	    		    // var markerPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시되는 위치

     	    		    var markerPosition = new kakao.maps.LatLng(33.48807825909141, 126.43313603394462); // 제주도 위의 임의의 마커 설정
     	    			var marker = new kakao.maps.Marker({
     	    			    position: markerPosition, 
     	    			    image: markerImage // 마커이미지 설정 
     	    			});
     	    		    
     	    			marker.setMap(map);
     	    			
     	    			// # 지도를 확대하며 가운데로 이동시킴
     	    		    var level = map.getLevel();
     	    		    map.setLevel(level - 5);
     			        map.panTo(markerPosition);   
     			    });
     			}
     		});
     	});
     	
     	// # XML형식으로 부터 데이터를 파싱하여 chargerArrObj에 각각 저장하는 함수
        function getData(data,type,chargerArrObj){ 
        	
      	    $(data).find("item").each(function(){ // xml의 item태그마다 적용
    		   
    		    if($(this).find("addr").text().includes("제주특별자치도")){ // 모든 데이터 중에 제주도의 데이터만 가져오기
    			  
    			    var addr; // 주소
            	    var chgerType; // 충전기타입
            	    var chgerId; // 충전기ID
            	    var csId; // 충전소ID
            	    var statNm; // 충전소이름
            	    var busiId; // 기관아이디
            	    var busiCall; // 운영기관 연락처
            	    var stat; // 충전기상태
            	    var useTime; // 사용시간
            	    var lat; // 위도
            	    var lng; // 경도
            	    var statUpdTime; // 상태 갱신 시각
            	    
            	    // # 환경부데이터, 한전데이터 별로 각각 취득
            	    // type 1 : 환경부 데이터
            	    if(type===1){
            		
            	        addr = $(this).find("addr").text(); // 주소
            	        chgerType = $(this).find("chgerType").text(); // 충전기타입
            	        chgerId = $(this).find("chgerId").text(); // 충전기ID
            	        if(chgerType==="02"){
            	        	chgerId = "완속" + chgerId;
            	        }else{
            	        	chgerId = "급속" + chgerId;
            	        }
            	        csId = $(this).find("statId").text(); // 충전소ID
            	        statNm = $(this).find("statNm").text(); // 충전소이름
            	        busiId = $(this).find("busiId").text();// 기관아이디
            	        busiCall = busiCall = $(this).find("busiCall").text(); // 운영기관 연락처
            	        stat = $(this).find("stat").text(); // 충전기상태
            	        if(stat==="0"){ // stat가 0일 경우에는 통신이상
            	        	stat = "1";
            	        }
            	        useTime = $(this).find("useTime").text(); // 사용시간
            	        lat = $(this).find("lat").text(); // 위도
            	        lng = $(this).find("lng").text(); // 경도
            	        statUpdTime = $(this).find("statUpdDt").text(); // 상태 갱신 시각
            	    	
            	        if(statUpdTime!==""){
            	        	tmp = statUpdTime.substring(0,4) + "-" + statUpdTime.substring(4,6) + "-" + statUpdTime.substring(6,8)
            	        	+ " " + statUpdTime.substring(8,10) + ":" + statUpdTime.substring(10,12) + ":" + statUpdTime.substring(12,14);
                		
            	       		statUpdTime = tmp;
            	        }else{
            	        	statUpdTime = "-";
            	        }
            	        
            	    }else if(type===2){
            		  
            		  
            		    addr = $(this).find("addr").text(); // 주소
            	        
            		    chgerType = $(this).find("cpTp").text(); // 충전기타입
            	        if(chgerType==="1" || chgerType==="2" || chgerType==="3" || chgerType==="4"){
            	        	chgerType="02";
            	        }else if(chgerType==="5"){
            	        	chgerType="01";
            	        }else if(chgerType==="6"){
            	        	chgerType="07";
            	        }else if(chgerType==="7"){
            	        	chgerType="04";
            	        }else if(chgerType==="8"){
            	        	chgerType="05";
            	        }else if(chgerType==="9"){
            	        	chgerType="03";
            	        }else if(chgerType==="10"){
            	        	chgerType="06";
            	        }
            		    
            	        chgerId = $(this).find("cpNm").text(); // 충전기ID
            	        csId = $(this).find("csId").text(); // 충전소ID
            	        statNm = $(this).find("csNm").text(); // 충전소이름
            	        busiId = "KJ";// 기관아이디
            	        busiCall = "1899-2100"; // 운영기관 연락처
            	        
            	        stat = $(this).find("cpStat").text(); // 충전기상태
            	        if(stat==="1"){
            	        	stat="2";
            	        }else if(stat==="2"){
            	        	stat="3";
            	        }else if(stat==="3"){
            	        	stat="5";
            	        }else if(stat==="4"){
            	        	stat="1";
            	        }else if(stat==="5"){
            	        	stat="5";
            	        }
            	        
            	        useTime = $(this).find("useTime").text(); // 사용시간
            	        lat = $(this).find("lat").text(); // 위도
            	        lng = $(this).find("longi").text(); // 경도
            	        statUpdTime = $(this).find("statUpdateDatetime").text(); // 상태 갱신 시각
            	        

            	    }
            	    
            	    // # 불러온 데이터를 저장하기 위한 getObj함수 호출
            	    getObj(addr,chgerType,chgerId,csId,statNm,busiId,busiCall,stat,useTime,lat,lng,statUpdTime,chargerArrObj);
    		    }
    		    
    	    }); 
        }
        
        // # 데이터를 object를 생성하여 저장하는 함수
        function getObj(addr,chgerType,chgerId,csId,statNm,busiId,busiCall,stat,useTime,lat,lng,statUpdTime,chargerArrObj){
    	  
    	    var listLen = chargerArrObj[busiId].length;
    	    
    	    if(listLen===0 || (chargerArrObj[busiId][listLen-1]).csId !== csId){ 
    	    	// chargerArrObj[busiId]에 처음 등록되거나 바로 이전에 동일한 충전소가 등록되어 있지 않을  경우
    	    	// 해당 충전소를 처음 저장하는 것이기 때문에 객체 생성
    	    	
        	    chgerObj = new Object(); // 충전소 객체 생성
			    chgerObj.slow = []; // 완속 충전기가 저장될 배열
			    chgerObj.rapid = []; // 급속 충전기가 저장될 배열
			  
			  
			    chgerObj.addr = addr; // 충전소 주소
			    chgerObj.csId = csId; // 충전소 ID
			    chgerObj.statNm = statNm; // 충전소 이름
			    chgerObj.busiId = busiId; // 기관아이디
			    chgerObj.busiCall = busiCall; // 기관 연락처
			    chgerObj.lat = lat; // 위도
			    chgerObj.lng = lng; // 경도
			    chgerObj.statUpdTime = statUpdTime; // 갱신시간
			    chgerObj.useTime = useTime; // 이용시간
				
			    
				addSlowOrRapid(chgerId,chgerType,stat,chgerObj); // chgerObj의 slow나 rapid의 value에 충전기 정보를 push
			    chargerArrObj[busiId].push(chgerObj); // chargerArrObj[busiId]에 push
			    
    	    }else if((chargerArrObj[busiId][listLen-1]).csId === csId){ // 동일한 충전소가 이미 저장되어 있는 경우
    	    	addSlowOrRapid(chgerId,chgerType,stat,chargerArrObj[busiId][listLen-1]); // 충전기 정보만 slow 혹은 rapid의 value 배열에 저장
    	    }

        }
      	
        function addSlowOrRapid(chgerId,chgerType,stat,chgerObj){
        	
        	if(chgerType==="02"){
				var slowObj = new Object();
				slowObj.chgerId = chgerId;
				slowObj.stat = stat;
				slowObj.chgerType = chgerType;
				chgerObj.slow.push(slowObj);
				
			}else{
				var rapidObj = new Object();
				rapidObj.chgerId = chgerId;
				rapidObj.stat = stat;
				rapidObj.chgerType = chgerType;
				chgerObj.rapid.push(rapidObj);
			}
        	
        }
        
        function setMarker(chargerArrObj){

        	var busiArr = Object.keys(chargerArrObj);
        	var busiArrLen = busiArr.length;
        	
        	for(var i=0;i<busiArrLen;i++){
        		
        		var busiId = busiArr[i];
        		var chrgArr = chargerArrObj[busiId];
        		var chrgArrLen = chrgArr.length;
        		
        		for(var j=0;j<chrgArrLen;j++){
        			
        			var chrg = chrgArr[j];
        			var addr = chrg["addr"];
        			var lat = chrg["lat"];
        			var lng = chrg["lng"];
        			var statNm = chrg["statNm"];

        			var imageSrc = "../image/marker/" + busiId + "_marker.png" // 마커이미지의 주소입니다    
    		        imageSize = new kakao.maps.Size(20, 32), // 마커이미지의 크기입니다
    		        imageOption = {offset: new kakao.maps.Point(10, 32)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
    		        
    		        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    			    var markerPosition = new kakao.maps.LatLng(lat, lng); // 마커가 표시될 위치입니다.
    			    
    			    var marker = new kakao.maps.Marker({
    			        position: markerPosition, 
    			        image: markerImage // 마커이미지 설정 
    			    });
    			    
    			    
    			    // ##### marker를 objec에 추가
    			    chrg.marker = marker;
    			    
    			    marker.setMap(map);
    			    
    			    var content = 
    			    	'<div style= "margin : -3px; padding : 10px; background-color : white; border-radius: 5px 5px 5px 5px; box-shadow: 1px 2px 3px 2px rgba(0,0,0,.3);">' +
    			        	'<div style="text-align : center; font-weight : bold; margin:5px; font-size : 12px; line-height : 16px;">' +
    			        	    statNm +
    			      		'</div>' +
    			      		'<div style="text-align : center; color : rgba(0,0,0,.5); margin:5px; font-size : 12px; line-height : 16px;">' +
    			        		addr +
    			      		'</div>' +
    		 	    	'</div>';
    		 	    	
    			    var infowindow = new kakao.maps.InfoWindow({
    		            content: content, // 인포윈도우에 표시할 내용
    		            removable : true
    		        });
    			    
    			    chrg.infowindow = infowindow;
    			    
				    closure(chrg);
        		}
        		
        	}  
	    }
        
        
        function closure(chrg) {
        	
        	var marker = chrg.marker;
        	var infowindow = chrg.infowindow;
        	var statNm = chrg.statNm;
        	var lat = chrg.lat;
        	var lng = chrg.lng;
        	var busiId = chrg.busiId;
        	var addr = chrg.addr;
        	if(busiId==="GN"){
        		busiId="지엔텔";
        	}else if(busiId ==="HE"){
        		busiId="한국전기차충전서비스";
        	}else if(busiId ==="JE"){
        		busiId="제주전기자동차서비스";
        	}else if(busiId ==="ME"){
        		busiId="환경부";
        	}else if(busiId ==="CV"){
        		busiId="대영채비";
        	}else if(busiId ==="KT"){
        		busiId="KT";
        	}else if(busiId ==="PI"){
        		busiId="차지비";
        	}else if(busiId ==="PW"){
        		busiId="파워큐브";
        	}else if(busiId ==="KJ"){
        		busiId="한국전력";
        	}
        	
        	var busiCall = chrg.busiCall;
        	var useTime = chrg.useTime;
        	if(useTime===""){
        		useTime="-";
        	}
        	var slow = chrg.slow;
        	var rapid = chrg.rapid;
        	var statUpdTime = chrg.statUpdTime;
        	var csId = chrg.csId;
        	
        	// aside_header_search_list에 이벤트 등록
        	
        	var listContent = "<div class='list' id='" + csId+ "'>" +
					            "<div class='statNm'>" + 
					           	   statNm +
					            "</div>" +
					            "<div class='addr'>" +
					               addr +
					            "</div>" +
					          "</div>";
			$(".aside_header_search_list").append(listContent);
			
			var id = "#" + csId;
			
			$(document).on("click",id,function(){
				
	            if (!selectedMarker || selectedMarker !== marker) {
	            	infowindow.open(map, marker);  
					if(selectedWindow){
						selectedWindow.close();
					}
	            }else if(selectedMarker === marker){
	            	infowindow.open(map, marker);  
	            }
				
	            // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
	            selectedMarker = marker;
	            selectedWindow = infowindow;
	            
				// infowindow open and move location
				infowindow.open(map,marker);
			    var moveLatLon = new kakao.maps.LatLng(lat, lng);
			    map.panTo(moveLatLon);    
			    
				$("#aside_contents_header_name").text(statNm);
				$(".aside_contents_menu_charginfo .slow+td").html(getChgerList(slow));
				$(".aside_contents_menu_charginfo .rapid+td").html(getChgerList(rapid));
				$(".aside_contents_menu_charginfo .statUpdTime+td").html(statUpdTime);
				$(".aside_contents_menu_otherinfo .addr+td").html(addr);
				$(".aside_contents_menu_otherinfo .useTime+td").html(useTime);
				$(".aside_contents_menu_otherinfo .busiId+td").html(busiId);
				$(".aside_contents_menu_otherinfo .busiCall+td").html(busiCall);
				$("#aside").animate({"width" : "350px"},200);
				
				// ----------------------------------------------
				// 주위의 spot 검색
				var places = new kakao.maps.services.Places();
				
				var restaurantArr = [];
				var tourArr = [];
				var medicalArr = [];
				var convenientArr = [];
				var martArr = [];
				
				// restaurant call back
				var restaurantCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
				    	}
				    	$(".restaurant_box .aside_box_wrap").html(content);
				    }
				};
				
				// tour call back
				var tourCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".tour_box .aside_box_wrap").html(content);
				    }
				};
				
				// medical call back
				var medicalCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".medical_box .aside_box_wrap").html(content);
				    }
				};
				
				// convenient call back
				var convenientCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".convenient_box .aside_box_wrap").html(content);
				    }
				};
				
				// mart call back
				var martCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".mart_box .aside_box_wrap").html(content);
				    }
				};
				// ### 공공기관 코드 검색
				// ## 음식점, 카페 ---------------------------------
				
				// # 음식점
				places.categorySearch('FD6', restaurantCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// ## 카페
				places.categorySearch('CE7', restaurantCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 관광, 숙박 ---------------------------------
				// # 관광
				places.categorySearch('AT4', tourCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 숙박
				places.categorySearch('AD5', tourCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 의료,복지 ---------------------------------
				// # 의료 
				places.categorySearch('HP8', medicalCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 약국
				places.categorySearch('PM9', medicalCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 문화시설,편의 ---------------------------------
				// # 문화시설
				places.categorySearch('CT1', convenientCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 편의
				places.categorySearch('CS2', convenientCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 마트 ---------------------------------
				// # 마트
				places.categorySearch('MT1', martCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
			});
			
        	// marker에 event 등록 ----------------------------------------------------
	    	kakao.maps.event.addListener(marker, 'mouseover', function() {
				
	        	// marker가 선택되어 있고 window창이 떠있지 않으면 초기화
	        	if(selectedMarker === marker){
	        		if(selectedMarker === marker && infowindow["f"]===null && infowindow["Pa"]===null && infowindow["h"]===null){
	        			selectedMarker=null;
	        			selectedWindow=null;
	        		}
	        	}

	            // 클릭된 마커가 없고, mouseover된 마커가 클릭된 마커가 아니면
	            // 마커의 이미지를 오버 이미지로 변경합니다
	            if (selectedMarker !== marker) {
	            	infowindow.open(map, marker);  
	            }
	        });
	        
	        // marker에 mouseout 이벤트등록
	        kakao.maps.event.addListener(marker, 'mouseout', function() {

	            // 클릭된 마커가 없고, mouseout된 마커가 클릭된 마커가 아니면
	            // 마커의 이미지를 기본 이미지로 변경합니다
	            if (selectedMarker !== marker) {
	            	infowindow.close();  
	            }
	        });
	        
	        // marker에 click 이벤트등록
	        kakao.maps.event.addListener(marker, 'click', function() {

	            // 클릭된 마커가 없고, click 마커가 클릭된 마커가 아니면
	            // 마커의 이미지를 클릭 이미지로 변경합니다
	            if (!selectedMarker || selectedMarker !== marker) {
	            	infowindow.open(map, marker);  
					if(selectedWindow){
						selectedWindow.close();
					}
	            }else if(selectedMarker === marker){
	            	infowindow.open(map, marker);  
	            }
				
	            // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
	            selectedMarker = marker;
	            selectedWindow = infowindow;
			
	            
	            // # 선택된 마커 중심으로 이동
			    map.panTo(marker.getPosition());   
	            
	            // ----------------------------------------------
	            // # aside에 내용넣기
	            
	            $("#aside_contents_header_name").text(statNm);
				$(".aside_contents_menu_charginfo .slow+td").html(getChgerList(slow));
				$(".aside_contents_menu_charginfo .rapid+td").html(getChgerList(rapid));
				$(".aside_contents_menu_charginfo .statUpdTime+td").html(statUpdTime);
				$(".aside_contents_menu_otherinfo .addr+td").html(addr);
				$(".aside_contents_menu_otherinfo .useTime+td").html(useTime);
				$(".aside_contents_menu_otherinfo .busiId+td").html(busiId);
				$(".aside_contents_menu_otherinfo .busiCall+td").html(busiCall);
				$("#aside").animate({"width" : "350px"},200);
				
				// ----------------------------------------------
				// 주위의 spot 검색
				var places = new kakao.maps.services.Places();
				
				var restaurantArr = [];
				var tourArr = [];
				var medicalArr = [];
				var convenientArr = [];
				var martArr = [];
				
				// restaurant call back
				var restaurantCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
				    	}
				    	$(".restaurant_box .aside_box_wrap").html(content);
				    }
				};
				
				// tour call back
				var tourCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".tour_box .aside_box_wrap").html(content);
				    }
				};
				
				// medical call back
				var medicalCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".medical_box .aside_box_wrap").html(content);
				    }
				};
				
				// convenient call back
				var convenientCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".convenient_box .aside_box_wrap").html(content);
				    }
				};
				
				// mart call back
				var martCb = function(result, status) {
				    if (status === kakao.maps.services.Status.OK) {
				        
				    	var len = result.length;
				    	var content = "";
				    	
				    	for(var i=0;i<len;i++){
				    		var address = "https://place.map.kakao.com/" + result[i].id;
				    		var popUp = "window.open('" + address + "','opened_place','width=1000,height=500,location=no,status=no');"
				    		
				    		content = content + 
					        	"<div class='aside_box_list' onclick=" + 
					        		popUp + 
					        		" style='cursor:pointer';>" 
					        		+  
			              			result[i].place_name+
			                	"</div>";
			                	
				    	}
				    	$(".mart_box .aside_box_wrap").html(content);
				    }
				};
				// ### 공공기관 코드 검색
				// ## 음식점, 카페 ---------------------------------
				
				// # 음식점
				places.categorySearch('FD6', restaurantCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// ## 카페
				places.categorySearch('CE7', restaurantCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 관광, 숙박 ---------------------------------
				// # 관광
				places.categorySearch('AT4', tourCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 숙박
				places.categorySearch('AD5', tourCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 의료,복지 ---------------------------------
				// # 의료 
				places.categorySearch('HP8', medicalCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 약국
				places.categorySearch('PM9', medicalCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 문화시설,편의 ---------------------------------
				// # 문화시설
				places.categorySearch('CT1', convenientCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				// # 편의
				places.categorySearch('CS2', convenientCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
				
				// ## 마트 ---------------------------------
				// # 마트
				places.categorySearch('MT1', martCb, {
				    // Map 객체를 지정하지 않았으므로 좌표객체를 생성하여 넘겨준다.
				    location: new kakao.maps.LatLng(lat, lng),
				    radius : 1000
				});
	        });
	    }
        
        function getChgerList(chgerArr){
        	
        	var arrLen = chgerArr.length;
			var content = "";
			
            for(var i=0;i<arrLen;i++){

            	var chgerId = chgerArr[i].chgerId; // 충전기 아이디
            	var stat = chgerArr[i].stat; // 충전기 상태 
            	// 1: 통신이상  2: 충전대기  3: 충전중  4: 운영중지  5 : 점검중  9 : 상태미확인
            	
            	if(stat==="1"){
            		stat = "통신이상";
            	}else if(stat==="2"){
            		stat = "충전대기";
            	}else if(stat==="3"){
            		stat = "충전중";
            	}else if(stat==="4"){
            		stat = "운영중지";
            	}else if(stat==="5"){
            		stat = "점검중";
            	}else if(stat==="9"){
            		stat = "상태미확인";
            	}
            	
            	var chgerType = chgerArr[i].chgerType; // 충전기 타입
            	
            	if(chgerType==="01"){
            		chgerType = "DC차데모";
            	}else if(chgerType==="02"){
            		chgerType = "AC완속";

            	}else if(chgerType==="03"){
            		chgerType = "DC차데모+AC3상";

            	}else if(chgerType==="04"){
            		chgerType = "DC콤보";

            	}else if(chgerType==="05"){
            		chgerType = "DC차데모+DC콤보";

            	}else if(chgerType==="06"){
            		chgerType = "DC차데모+AC3상 +DC콤보";

            	}else if(chgerType==="07"){
            		chgerType = "AC3상";

            	}
            	
            	content = content +
            		"<div class='chger'>" + 
				    	"<div class='chger_id'>"+chgerId+"</div>" +
				        "<div class='chger_stat'>"+stat+"</div>" +
				        "<div class='chger_chgerType'>"+chgerType+"</div>" +
				     "</div>";
            }
            if(content===""){
            	content = "-";
            }
            return content;
        }