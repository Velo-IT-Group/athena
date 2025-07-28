exports.getContact = async (ticketId: number) => {
    console.log("ticketId", ticketId);
    const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${process.env.BASE_URL}/service/tickets/${ticketId}?fields=board/id,status/id,status/name,_info/dateEntered`,
        headers: {
            clientId: process.env.CLIENT_ID,
            Authorization: process.env.CW_AUTH,
        },
    };

    try {
        const { data } = await axios.request(config);

        return data;
    } catch (error) {
        return error;
    }
};
