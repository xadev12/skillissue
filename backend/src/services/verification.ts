import { prisma } from '../index';
import exifr from 'exifr';

interface EXIFData {
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
}

/**
 * Verify job proof based on proof type
 */
export async function verifyJobProof(jobId: string): Promise<{ passed: boolean; reason?: string }> {
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });
  
  if (!job || !job.deliverableUrl) {
    return { passed: false, reason: 'Job or deliverable not found' };
  }
  
  switch (job.proofType) {
    case 'CODE':
      return verifyCodeProof(job);
    case 'CONTENT':
      return verifyContentProof(job);
    case 'PHYSICAL':
      return verifyPhysicalProof(job);
    default:
      return { passed: false, reason: 'Manual verification required' };
  }
}

/**
 * Verify code submission via test results
 */
async function verifyCodeProof(job: any): Promise<{ passed: boolean; reason?: string }> {
  const proofData = job.proofData as any;
  
  if (!proofData?.testResults) {
    return { passed: false, reason: 'No test results provided' };
  }
  
  const { testResults } = proofData;
  
  // Check tests passed
  if (!testResults.passed) {
    return { passed: false, reason: 'Tests failed' };
  }
  
  // Check coverage threshold
  const minCoverage = proofData.minCoverage || 80;
  if (testResults.coverage < minCoverage) {
    return { 
      passed: false, 
      reason: `Coverage ${testResults.coverage}% below minimum ${minCoverage}%` 
    };
  }
  
  return { passed: true };
}

/**
 * Verify content via plagiarism and quality checks
 */
async function verifyContentProof(job: any): Promise<{ passed: boolean; reason?: string }> {
  const proofData = job.proofData as any;
  
  // TODO: Integrate Copyleaks API for plagiarism check
  // const plagiarismScore = await checkPlagiarism(job.deliverableUrl);
  
  // Mock checks for now
  const plagiarismScore = proofData?.plagiarismScore || 0;
  const qualityScore = proofData?.qualityScore || 0;
  
  if (plagiarismScore > 15) {
    return { passed: false, reason: `Plagiarism detected: ${plagiarismScore}%` };
  }
  
  if (qualityScore < 7) {
    return { passed: false, reason: `Quality score too low: ${qualityScore}/10` };
  }
  
  return { passed: true };
}

/**
 * Verify physical proof via EXIF GPS data
 */
async function verifyPhysicalProof(job: any): Promise<{ passed: boolean; reason?: string }> {
  try {
    // Download photo from deliverableUrl
    const response = await fetch(job.deliverableUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Extract EXIF data
    const exifData = await exifr.parse(buffer, {
      gps: true,
      exif: true,
    });
    
    if (!exifData?.latitude || !exifData?.longitude) {
      return { passed: false, reason: 'No GPS data in photo' };
    }
    
    // Check location within radius
    const distance = calculateDistance(
      exifData.latitude,
      exifData.longitude,
      job.locationLat!,
      job.locationLng!
    );
    
    const radius = job.locationRadius || 100; // meters
    if (distance > radius) {
      return { 
        passed: false, 
        reason: `Photo taken ${Math.round(distance)}m from target (max ${radius}m)` 
      };
    }
    
    // Check timestamp within deadline
    const photoTime = new Date(exifData.DateTimeOriginal || exifData.CreateDate);
    if (photoTime > job.deadline) {
      return { passed: false, reason: 'Photo taken after deadline' };
    }
    
    // Store EXIF data
    await prisma.job.update({
      where: { id: job.id },
      data: {
        proofData: {
          ...job.proofData as any,
          exif: {
            latitude: exifData.latitude,
            longitude: exifData.longitude,
            timestamp: photoTime,
            distance: Math.round(distance),
          }
        }
      }
    });
    
    return { passed: true };
    
  } catch (error) {
    console.error('EXIF verification error:', error);
    return { passed: false, reason: 'Failed to verify photo' };
  }
}

/**
 * Calculate haversine distance between two coordinates
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
