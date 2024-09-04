// Fetching all orders
export const fetchOrders = async (page: number = 1, pageSize: number = 10) => {
  try {
    // Construct the query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    // Make the GET request to the /orders endpoint
    const response = await fetch(
      `/api/qrapp/orders?${queryParams.toString()}`,
      { cache: "no-store" }
    );

    // Handle the response
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    // Parse the response data
    const data = await response.json();
    return data; // Return the data for further use
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Fetching single order by ID
export const fetchOrderById = async (orderId: string) => {
  try {
    // Make the GET request to the /orders/[id] endpoint
    const response = await fetch(`/api/qrapp/orders/${orderId}`, {
      cache: "no-store",
    });

    // Handle the response
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    // Parse the response data
    const data = await response.json();
    return data; // Return the data for further use
  } catch (error) {
    console.error(error);
    throw error;
  }
};
