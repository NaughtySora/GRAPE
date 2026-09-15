const { resolve } = require("node:path");

const absolute = path => resolve(__dirname, path);

module.exports = {
  services: [
    {
      name: "user",
      instances: [
        {
          name: "public",
          path: absolute("user/public.js"),
          ports: [3000, 3001, 3002, 3003],
          balancer: 23000,
        },
        {
          name: "mobile",
          path: absolute("user/mobile.js"),
          ports: [3100, 3101, 3102],
          balancer: 24000,
        },
        {
          name: "admin",
          path: absolute("user/admin.js"),
          ports: [3200, 3201],
          balancer: 25000,
        },
        {
          name: "integration",
          path: absolute("user/integration.js"),
          ports: [3300, 3301],
          balancer: 26000,
        }
      ],
    },
    {
      name: "order",
      instances: [
        {
          name: "public",
          path: absolute("order/public.js"),
          ports: [4000, 4001, 4002, 4003],
          balancer: 27000,
        },
        {
          name: "admin",
          path: absolute("order/admin.js"),
          ports: [4200, 4201],
          balancer: 28000,
        },
        {
          name: "integration",
          path: absolute("order/integration.js"),
          ports: [4300, 4301],
          balancer: 29000,
        }
      ],
    },
    {
      name: "notification",
      instances: [
        {
          name: "integration",
          path: absolute("notification/integration.js"),
          ports: [5300, 5301],
          balancer: 30000,
        }
      ],
    },
  ],
  gateway: {
    path: absolute("gateway.js"),
    public: 10000,
    mobile: 10001,
    admin: 10002,
    integration: 10003,
  },
  balancer: {
    path: absolute("balancer.js"),
    public: 12222,
    mobile: 12223,
    admin: 12224,
    integration: 12225,
  },
  booting: {
    public: ["user", "order"],
    mobile: ["user",],
    admin: ["user", "order"],
    integration: ["user", "order", "notification"],
  },
  client: {
    public: [
      { method: "POST", service: "user", url: "signin", },
      { method: "GET", service: "user", url: "profile", },
      { method: "PATCH", service: "user", url: "address", },
      { method: "POST", service: "order", url: "", },
      { method: "GET", service: "order", url: "pending", },
    ],
    integration: [
      { method: "GET", service: "notification", url: "health", },
      { method: "GET", service: "notification", url: "", },
      { method: "GET", service: "user", url: "address", },
      { method: "GET", service: "user", url: "pending", },
      { method: "GET", service: "order", url: "list", },
      { method: "GET", service: "order", url: "health", },
    ],
    admin: [
      { method: "GET", service: "user", url: "list", },
      { method: "GET", service: "order", url: "list", },
    ],
    mobile: [
      { method: "POST", service: "user", url: "signin", },
      { method: "GET", service: "user", url: "profile", },
      { method: "PATCH", service: "user", url: "address", },
    ],
  }
};

