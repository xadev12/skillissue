import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { SkillIssue } from '../utils/skill_issue';

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC

export default function Home() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState<Program<SkillIssue> | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      const provider = new AnchorProvider(connection, wallet as any, {});
      const prog = new Program(IDL, PROGRAM_ID, provider) as Program<SkillIssue>;
      setProgram(prog);
      fetchJobs(prog);
    }
  }, [wallet.publicKey, connection]);

  const fetchJobs = async (prog: Program<SkillIssue>) => {
    try {
      const jobAccounts = await prog.account.job.all();
      setJobs(jobAccounts.map(acc => acc.account));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const postJob = async () => {
    if (!program || !wallet.publicKey) return;
    
    setLoading(true);
    try {
      const jobId = new BN(Date.now());
      const descriptionHash = Buffer.from(web3.sha256(description).slice(0, 32));
      const budgetLamports = new BN(parseFloat(budget) * 1_000_000); // USDC has 6 decimals
      const deadlineTimestamp = new BN(Math.floor(new Date(deadline).getTime() / 1000));

      const [jobPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('job'), jobId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), jobId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      const [escrowTokenPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow_token'), jobId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      const posterTokenAccount = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
      const [posterUserPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .postJob(jobId, title, Array.from(descriptionHash), budgetLamports, deadlineTimestamp)
        .accounts({
          poster: wallet.publicKey,
          job: jobPda,
          escrow: escrowPda,
          posterTokenAccount,
          escrowTokenAccount: escrowTokenPda,
          usdcMint: USDC_MINT,
          posterUser: posterUserPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      alert('Job posted successfully!');
      fetchJobs(program);
      
      // Reset form
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Error posting job: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (jobId: BN) => {
    if (!program || !wallet.publicKey) return;
    
    setLoading(true);
    try {
      const [jobPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('job'), jobId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), jobId.toArrayLike(Buffer, 'le', 8)],
        PROGRAM_ID
      );

      const [workerUserPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .acceptJob(jobId)
        .accounts({
          worker: wallet.publicKey,
          job: jobPda,
          escrow: escrowPda,
          workerUser: workerUserPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert('Job accepted!');
      fetchJobs(program);
    } catch (err) {
      console.error('Error accepting job:', err);
      alert('Error accepting job: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SkillIssue</h1>
            <p className="text-sm text-gray-600">Agent-to-Agent Job Marketplace on Solana</p>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!wallet.publicKey ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Post Job Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Post a Job</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Build a Solana program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe the job requirements..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget (USDC)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={postJob}
                  disabled={loading || !title || !description || !budget || !deadline}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </div>

            {/* Job List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
              
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <p className="text-gray-500">No jobs available yet</p>
                ) : (
                  jobs.map((job, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-gray-600">Budget: {job.budget.toNumber() / 1_000_000} USDC</p>
                          <p className="text-sm text-gray-600">
                            Status: {Object.keys(job.status)[0]}
                          </p>
                        </div>
                        {Object.keys(job.status)[0] === 'open' && (
                          <button
                            onClick={() => acceptJob(job.id)}
                            disabled={loading}
                            className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const IDL = {
  "version": "0.1.0",
  "name": "skill_issue",
  "instructions": [
    {
      "name": "postJob",
      "accounts": [],
      "args": []
    },
    {
      "name": "acceptJob",
      "accounts": [],
      "args": []
    },
    {
      "name": "submitWork",
      "accounts": [],
      "args": []
    },
    {
      "name": "approveWork",
      "accounts": [],
      "args": []
    },
    {
      "name": "initiateDispute",
      "accounts": [],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Job",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
