(function () {
  "use strict";

  /*
   * API CLIENT
   *
   * الواجهة لا تعتبر LocalStorage أو HTML مصدرًا للحقيقة.
   * المصدر الحقيقي مستقبلًا:
   *
   * UI
   * ↓
   * Service
   * ↓
   * API Client
   * ↓
   * Backend
   * ↓
   * Database
   */


  const CONFIG = {
    baseURL:
      window.MALAK_API_BASE_URL ||
      "/api",

    timeout: 15000,

    credentials: "include"
  };


  class ApiError extends Error {

    constructor(message, options = {}) {

      super(message);

      this.name = "ApiError";

      this.status = options.status || 0;
      this.code = options.code || null;
      this.details = options.details || null;
    }

  }


  function buildURL(path) {

    const cleanPath =
      String(path || "")
        .replace(/^\/+/, "");

    return `${CONFIG.baseURL}/${cleanPath}`;
  }


  async function request(
    path,
    options = {}
  ) {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        CONFIG.timeout
      );


    try {

      const headers = new Headers(
        options.headers || {}
      );

      if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
      ) {
        headers.set(
          "Content-Type",
          "application/json"
        );
      }


      const response =
        await fetch(
          buildURL(path),
          {
            ...options,
            headers,
            credentials:
              options.credentials ||
              CONFIG.credentials,

            signal:
              options.signal ||
              controller.signal
          }
        );


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      let data = null;


      if (
        contentType.includes(
          "application/json"
        )
      ) {

        try {
          data = await response.json();
        } catch {
          data = null;
        }

      } else {

        try {
          data = await response.text();
        } catch {
          data = null;
        }

      }


      if (!response.ok) {

        throw new ApiError(
          data?.message ||
          data?.error ||
          `فشل الطلب (${response.status})`,
          {
            status: response.status,
            code: data?.code || null,
            details: data
          }
        );

      }


      return data;

    } catch (error) {

      if (
        error.name === "AbortError"
      ) {

        throw new ApiError(
          "انتهت مهلة الاتصال بالخادم.",
          {
            code: "TIMEOUT"
          }
        );

      }


      if (
        error instanceof ApiError
      ) {
        throw error;
      }


      throw new ApiError(
        "تعذر الاتصال بالخادم.",
        {
          code: "NETWORK_ERROR",
          details: error
        }
      );

    } finally {

      clearTimeout(timeout);

    }

  }


  async function get(
    path,
    options = {}
  ) {

    return request(
      path,
      {
        ...options,
        method: "GET"
      }
    );

  }


  async function post(
    path,
    body,
    options = {}
  ) {

    return request(
      path,
      {
        ...options,
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body)
      }
    );

  }


  async function put(
    path,
    body,
    options = {}
  ) {

    return request(
      path,
      {
        ...options,
        method: "PUT",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body)
      }
    );

  }


  async function patch(
    path,
    body,
    options = {}
  ) {

    return request(
      path,
      {
        ...options,
        method: "PATCH",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body)
      }
    );

  }


  async function del(
    path,
    options = {}
  ) {

    return request(
      path,
      {
        ...options,
        method: "DELETE"
      }
    );

  }


  window.MalakAPI = {
    config: CONFIG,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    ApiError
  };


})();
