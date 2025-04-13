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

interface CallAnalysis {
    in_voicemail: boolean;
    call_summary: string;
    user_sentiment: string;
    custom_analysis_data: {
        detailed_health_report: string;
    };
    call_successful: boolean;
}

export interface CallDetails {
    call_id: string;
    call_status: string;
    duration?: number;
    call_analysis?: CallAnalysis;
    summary?: string;
    user_sentiment?: string;
    transcript?: string;
    start_time?: string;
    end_time?: string;
    recording_url?: string;
}

export const retellService = {
    async createCall(phoneNumber: string, userName: string): Promise<string> {
        try {
            console.log('Creating call with phone number:', phoneNumber);
            const response = await retellAxios.post('/create-phone-call', {
                from_number: FROM_PHONE_NUMBER,
                to_number: phoneNumber,
                override_agent_id: AGENT_ID,
                retell_llm_dynamic_variables: {
                    user_name: userName
                }
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
            console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
            console.log('Call Analysis Data:', response.data.call_analysis);
            
            // Map the response data to our CallDetails interface
            const callDetails: CallDetails = {
                call_id: response.data.call_id,
                call_status: response.data.call_status,
                duration: response.data.duration_ms,
                call_analysis: response.data.call_analysis,  // Include full call_analysis object
                recording_url: response.data.recording_url
            };
            
            console.log('Processed call details:', JSON.stringify(callDetails, null, 2));
            return callDetails;
        } catch (error) {
            console.error('Error fetching call details:', error);
            throw new Error('Failed to fetch call details');
        }
    }
};