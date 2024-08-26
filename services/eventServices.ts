export const fetchEvents = async (page: number = 1, pageSize: number = 10) => {
  try {
    // Construct the query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    // Make the GET request to the /events endpoint
    const response = await fetch(`/api/qrapp/events?${queryParams.toString()}`);

    // Handle the response
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    // Parse the response data
    const data = await response.json();
    return data; // Return the data for further use
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
