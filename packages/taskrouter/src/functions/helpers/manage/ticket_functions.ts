const axios = require("axios");

type GetTicketParams = {
    ticketId: number;
};

exports.getTicket = async (ticketId: number) => {
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

type CreateTicketParams = {
    id: number;
    name: string;
    companyId: number;
    phoneNumber: string;
};

exports.createTicket = async (parameters: CreateTicketParams) => {
    const { id, name, companyId, phoneNumber } = parameters;

    const data = JSON.stringify({
        summary: `Message from ${name ?? "Unknown Caller"} - (${phoneNumber})`,
        contact: id
            ? {
                id,
            }
            : null,
        company: {
            id: companyId || 250,
        },
        board: {
            id: 30,
        },
        priority: {
            id: 6,
        },
    });

    const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.BASE_URL}/service/tickets`,
        headers: {
            clientId: `${process.env.CLIENT_ID}`,
            "Content-Type": "application/json",
            Authorization: `${process.env.CW_AUTH}`,
        },
        data: data,
    };

    try {
        const { data } = await axios.request(config);
        if (!!!data) throw Error;
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

type CreateAttachmentParams = {
    attachmentUrl: string;
    ticketId: number;
};

exports.createAttachment = async (parameters: CreateAttachmentParams) => {
    const { attachmentUrl, ticketId } = parameters;
    const data = new FormData();
    data.append("recordId", `${ticketId}`);
    data.append("recordType", "Ticket");
    data.append("title", "Call Recording");
    data.append("url", `${attachmentUrl}`);
    data.append("privateFlag", "false");

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.BASE_URL}/system/documents`,
        headers: {
            clientId: `${process.env.CLIENT_ID}`,
            Authorization: `${process.env.CW_AUTH}`,
        },
        data: data,
    };

    try {
        const { data } = await axios.request(config);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};
