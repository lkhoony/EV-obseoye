package jeju;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ApiServlet")
public class ApiServlet extends HttpServlet {
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doHandle(request, response);
	}


	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doHandle(request, response);
	}
	
	protected void doHandle(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		request.setCharacterEncoding("utf-8");
		response.setContentType("text/xml;charset=utf-8");
		PrintWriter out = response.getWriter();
		StringBuilder sb = new StringBuilder();
		String type = request.getParameter("type");
		System.out.println(type);
		StringBuilder urlBuilder=null;
		
		// 11PtzPKFz%2F8XXCD0NO7lxl7%2Fb7VDNEFtTpbcvYi2vzDBicQpPAz5o7auO3VtzGUZcfibeIh0aWgRVOeoL6I06A%3D%3D
		if(type.equals("1")) {
			String pageNo = request.getParameter("pageNo");
			System.out.println(pageNo);
			urlBuilder = new StringBuilder(
					"http://open.ev.or.kr:8080/openapi/services/EvCharger/getChargerInfo"); /* URL */
			urlBuilder.append("?" + URLEncoder.encode("ServiceKey","UTF-8") + "=11PtzPKFz%2F8XXCD0NO7lxl7%2Fb7VDNEFtTpbcvYi2vzDBicQpPAz5o7auO3VtzGUZcfibeIh0aWgRVOeoL6I06A%3D%3D"); /*Service Key*/
			urlBuilder.append("&" + URLEncoder.encode("ServiceKey", "UTF-8") + "="
					+ URLEncoder.encode("-", "UTF-8")); /* 공공데이터포털에서 받은 인증키 */
			urlBuilder.append(
					"&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode(pageNo, "UTF-8")); /* 페이지번호 */
			urlBuilder.append("&" + URLEncoder.encode("pageSize", "UTF-8") + "="
					+ URLEncoder.encode("10000", "UTF-8")); /* 한 페이지 결과 수 */
		
		}else if(type.equals("2")){
			urlBuilder = new StringBuilder(
					"http://openapi.kepco.co.kr/service/EvInfoServiceV2/getEvSearchList"); /* URL */
			urlBuilder.append("?" + URLEncoder.encode("ServiceKey","UTF-8") + "=11PtzPKFz%2F8XXCD0NO7lxl7%2Fb7VDNEFtTpbcvYi2vzDBicQpPAz5o7auO3VtzGUZcfibeIh0aWgRVOeoL6I06A%3D%3D"); /*Service Key*/
			urlBuilder.append("&" + URLEncoder.encode("ServiceKey", "UTF-8") + "="
					+ URLEncoder.encode("-", "UTF-8")); /* 공공데이터포털에서 받은 인증키 */
			urlBuilder.append(
					"&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8")); /* 페이지번호 */
			urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "="
					+ URLEncoder.encode("10000", "UTF-8")); /* 한 페이지 결과 수 */
		
		}

		URL url = new URL(urlBuilder.toString());
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setRequestProperty("Content-type", "application/json");
		System.out.println("Response code: " + conn.getResponseCode());
		BufferedReader rd;
		if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
			rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		} else {
			rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
		}
		String line;
		while ((line = rd.readLine()) != null) {
			sb.append(line);
		}

		rd.close();
		conn.disconnect();

		out.write(sb.toString());
        out.flush();
        out.close();
	}
}
