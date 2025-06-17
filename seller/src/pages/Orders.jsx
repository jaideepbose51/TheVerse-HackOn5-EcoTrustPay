import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { currency } from "../App";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Mock data for orders
    const mockOrders = [
      {
        _id: "1",
        items: [
          {
            name: "Organic Cotton T-Shirt",
            price: 24.99,
            quantity: 2,
            size: "M",
            sellerId: "seller123",
            status: "Order Placed",
          },
          {
            name: "Eco-Friendly Water Bottle",
            price: 19.99,
            quantity: 1,
            sellerId: "seller123",
            status: "Order Placed",
          },
        ],
        address: {
          firstName: "Jaideep",
          lastName: "Bose",
          street: "123 KIIT University",
          city: "Dhanbad",
          state: "Jharkhand",
          country: "India",
          zipCode: "12345",
          phone: "555-123-4567",
        },
        paymentMethod: "Credit Card",
        payment: true,
        createdAt: new Date(),
      },
      {
        _id: "2",
        items: [
          {
            name: "Bamboo Toothbrush Set",
            price: 12.99,
            quantity: 3,
            sellerId: "seller123",
            status: "Packing",
          },
        ],
        address: {
          firstName: "Ayush",
          lastName: "Srivastava",
          street: "KP-5A, KIIT University",
          city: "Patna",
          state: "Bihar",
          country: "India",
          zipCode: "67890",
          phone: "555-987-6543",
        },
        paymentMethod: "PayPal",
        payment: true,
        createdAt: new Date(Date.now() - 86400000), // Yesterday
      },
    ];

    setOrders(mockOrders);
  }, []);

  const statusHandler = (event, orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order._id === orderId) {
          return {
            ...order,
            items: order.items.map((item) => ({
              ...item,
              status: event.target.value,
            })),
          };
        }
        return order;
      })
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-6">Your Orders</h3>
      <div>
        {orders.length === 0 ? (
          <p className="text-center py-10">No orders found</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            >
              <img
                className="w-12"
                src={assets.parcel_icon}
                alt="parcel icon"
              />
              <div>
                <div>
                  {order.items.map((item, index) => (
                    <div key={index} className="py-1">
                      <p>
                        {item.name} x {item.quantity}
                        {item.size && ` (${item.size})`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Status: {item.status}
                      </p>
                      {index < order.items.length - 1 && (
                        <hr className="my-1" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street},</p>
                  <p>
                    {order.address.city}, {order.address.state},{" "}
                    {order.address.country}, {order.address.zipCode}
                  </p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p>Items: {order.items.length}</p>
                <p className="mt-2">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <p>
                {currency}
                {order.items
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.items[0]?.status || "Order Placed"}
                className="p-2 font-semibold border rounded"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
