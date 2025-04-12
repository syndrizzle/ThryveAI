import axios from 'axios';

const RETELL_API_KEY = import.meta.env.VITE_RETELL_API_KEY || '';
const AGENT_ID = import.meta.env.VITE_AGENT_ID || '';
const FROM_PHONE_NUMBER = import.meta.env.VITE_FROM_PHONE_NUMBER || '';

if (!RETELL_API_KEY || !AGENT_ID || !FROM_PHONE_NUMBER) {
    console.error('Missing required environment variables:');
    if (!RETELL_API_KEY) console.error('- VITE_RETELL_API_KEY');
    if (!AGENT_ID) console.error('- VITE_AGENT_ID');
    if (!FROM_PHONE_NUMBER) console.error('- VITE_FROM_PHONE_NUMBER');
}

const retellAxios = axios.create({
    baseURL: 'https://api.retellai.com/v2',
    headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

export interface CallDetails {
    summary?: string;
    user_sentiment?: string;
    transcript?: string;
    call_status?: string;
    call_id?: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    recording_url?: string;
}

export const retellService = {
    async createCall(phoneNumber: string): Promise<string> {
        try {
            console.log('Creating call with phone number:', phoneNumber);
            const response = await retellAxios.post('/create-phone-call', {
                from_number: FROM_PHONE_NUMBER,
                to_number: phoneNumber,
                override_agent_id: AGENT_ID,
                retell_llm_dynamic_variables: {}
            });
            console.log('Call created successfully:', response.data);
            return response.data.call_id;
        } catch (error) {
            console.error('Error creating call:', error);
            throw new Error('Failed to create call');
        }
    },

    async getCallDetails(callId: string): Promise<CallDetails> {
        try {
            console.log('Fetching call details for call ID:', callId);
            const response = await retellAxios.get(`/get-call/${callId}`);
            console.log('Call details response:', response.data);
            
            // Map the response data to our CallDetails interface
            const callDetails: CallDetails = {
                summary: response.data.call_analysis?.call_summary,
                user_sentiment: response.data.call_analysis?.user_sentiment,
                transcript: response.data.transcript,
                call_status: response.data.call_status,
                call_id: response.data.call_id,
                start_time: response.data.start_time,
                end_time: response.data.end_time,
                duration: response.data.duration,
                recording_url: response.data.recording_url
            };
            
            console.log('Processed call details:', callDetails);
            return callDetails;
        } catch (error) {
            console.error('Error fetching call details:', error);
            throw new Error('Failed to fetch call details');
        }
    }
}; 