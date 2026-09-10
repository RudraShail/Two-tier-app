import axios from "axios";

const testingURL = "http://localhost:8080/api";
const productionURL = "https://hr-mgmt-sys-b-1.onrender.com/api"; // Replace with your actual production URL

const instance = axios.create({
  baseURL: productionURL || testingURL, // Replace with your backend URL
  withCredentials: true, // for cookies if needed
});

export default instance;
