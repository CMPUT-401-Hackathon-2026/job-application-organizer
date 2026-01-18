// import { apiFetch } from './client';
// import type { Application, ApplicationStatus } from '../types';

// /**
//  * Convert DRF response → frontend shape
//  */
// function mapApplication(apiApp: any): Application {
//   return {
//     id: apiApp.id,
//     job: apiApp.job,
//     dateApplied: apiApp.date_applied ?? null,
//     status: apiApp.stage,
//   };
// }

// export const applications = {
//   list: async (): Promise<Application[]> => {
//     const data = await apiFetch('/applications/'); // ✅ trailing slash
//     return data.map(mapApplication);
//   },

//   create: async (jobId: number): Promise<Application> => {
//     const data = await apiFetch('/applications/', {
//       method: 'POST',
//       body: JSON.stringify({
//         job: jobId,          // 🔥 backend expects FK id
//         stage: 'applied',
//       }),
//     });
//     return mapApplication(data);
//   },

//   updateStatus: async (id: number, status: ApplicationStatus) => {
//     const data = await apiFetch(`/applications/${id}/`, {
//       method: 'PATCH',
//       body: JSON.stringify({ stage: status }),
//     });
//     return mapApplication(data);
//   },
// };
