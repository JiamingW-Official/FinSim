"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Transaction {
  from: string;
  to: string;
  amount: number;
  fee: number;
}

interface Block {
  height: number;
  hash: string;
  prevHash: string;
  transactions: Transaction[];
  nonce: number;
  timestamp: number;
  miner: string;
}

const WALLETS = [
  "0xA1b2C3",
  "0xD4e5F6",
  "0x7G8h9I",
  "0xJk1L2M",
  "0xN3o4P5",
  "0xQ6r7S8",
  "0xMiner1",
  "0xMiner2",
];

const MINERS = ["0xMiner1", "0xMiner2", "0xPool3", "0xPool4"];

function truncateHash(hash: string): string {
  return hash.slice(0, 8) + "...";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Deterministic hash simulation — not cryptographic
function simulateHash(height: number, nonce: number, prevHash: string): string {
  return btoa(String(height) + String(nonce) + prevHash)
    .replace(/[^a-zA-Z0-9]/g, "0")
    .slice(0, 16)
    .toLowerCase();
}

function makeSyntheticTx(seed: number): Transaction {
  const s = (n: number) => ((n * 1103515245 + 12345) & 0x7fffffff);
  const s1 = s(seed);
  const s2 = s(s1);
  const s3 = s(s2);
  const s4 = s(s3);
  return {
    from: WALLETS[s1 % WALLETS.length],
    to: WALLETS[s2 % WALLETS.length],
    amount: Math.round(((s3 % 9900) + 100) / 100) / 10, // 0.1–99
    fee: Math.round(((s4 % 90) + 10)) / 1000, // 0.010–0.099
  };
}

const GENESIS_BLOCK: Block = {
  height: 0,
  hash: "0000000000000000",
  prevHash: "0000000000000000",
  transactions: [],
  nonce: 0,
  timestamp: Date.now() - 1_200_000,
  miner: "Satoshi",
};

function generateInitialPending(): Transaction[] {
  return Array.from({ length: 4 }, (_, i) => makeSyntheticTx(Date.now() + i * 997));
}

// Block card in the chain
function BlockCard({
  block,
  selected,
  onClick,
}: {
  block: Block;
  selected: boolean;
  onClick: () => void;
}) {
  const isGenesis = block.height === 0;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-44 rounded-lg border p-3 text-left transition-colors",
        isGenesis
          ? "border-border/40 bg-muted/30 text-muted-foreground"
          : selected
          ? "border-[#2d9cdb] bg-[#2d9cdb]/10 text-foreground"
          : "border-border/60 bg-card text-foreground hover:border-border"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {isGenesis ? "Genesis" : `Block #${block.height}`}
        </span>
        {!isGenesis && (
          <span className="text-[10px] text-muted-foreground">
            {block.transactions.length} tx
          </span>
        )}
      </div>
      <div className="font-mono text-xs text-foreground/80 mb-1 truncate">
        {truncateHash(block.hash)}
      </div>
      <div className="text-[10px] text-muted-foreground font-mono truncate">
        prev: {truncateHash(block.prevHash)}
      </div>
      {!isGenesis && (
        <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
          {formatTime(block.timestamp)}
        </div>
      )}
    </button>
  );
}

// Arrow connector between blocks
function ChainArrow() {
  return (
    <div className="flex-shrink-0 flex items-center self-center px-1">
      <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
        <line x1="0" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        <polyline points="16,2 22,7 16,12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" className="text-border" />
      </svg>
    </div>
  );
}

// Mining dots animation
function MiningDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#2d9cdb] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "700ms" }}
        />
      ))}
    </span>
  );
}

// Transaction row
function TxRow({ tx, idx }: { tx: Transaction; idx: number }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/20 last:border-0">
      <span className="text-[11px] text-muted-foreground w-4 shrink-0">{idx + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span className="text-foreground/70 truncate max-w-[64px]">{tx.from}</span>
          <svg width="16" height="8" viewBox="0 0 16 8" className="shrink-0 text-muted-foreground/50">
            <line x1="0" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
            <polyline points="8,1 12,4 8,7" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-foreground/70 truncate max-w-[64px]">{tx.to}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[11px] font-medium tabular-nums">{tx.amount} BTC</div>
        <div className="text-[10px] text-muted-foreground">fee {tx.fee}</div>
      </div>
    </div>
  );
}

export function BlockchainVisualizer() {
  const [blocks, setBlocks] = useState<Block[]>([GENESIS_BLOCK]);
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>(generateInitialPending);
  const [mining, setMining] = useState(false);
  const [difficulty, setDifficulty] = useState(2);
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number | null>(null);
  const txSeedRef = useRef(Date.now() + 10000);

  const selectedBlock = selectedBlockHeight !== null
    ? blocks.find((b) => b.height === selectedBlockHeight) ?? null
    : null;

  function addTransaction() {
    txSeedRef.current += 1337;
    setPendingTxs((prev) => {
      if (prev.length >= 8) return prev;
      return [...prev, makeSyntheticTx(txSeedRef.current)];
    });
  }

  function mineBlock() {
    if (mining || pendingTxs.length === 0) return;
    setMining(true);

    // Simulate mining delay proportional to difficulty
    const delay = 800 + difficulty * 350;

    setTimeout(() => {
      setBlocks((prev) => {
        const tip = prev[prev.length - 1];
        const nonce = Math.floor(Math.random() * 999999) + 1;
        const newHash = simulateHash(tip.height + 1, nonce, tip.hash);
        const newBlock: Block = {
          height: tip.height + 1,
          hash: newHash,
          prevHash: tip.hash,
          transactions: [...pendingTxs],
          nonce,
          timestamp: Date.now(),
          miner: MINERS[Math.floor(Math.random() * MINERS.length)],
        };
        return [...prev, newBlock];
      });
      setPendingTxs([]);
      setMining(false);
    }, delay);
  }

  const tipBlock = blocks[blocks.length - 1];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Blockchain Visualizer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {blocks.length - 1} confirmed block{blocks.length !== 2 ? "s" : ""} &middot; chain height {tipBlock.height}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Difficulty</span>
          {[1, 2, 3].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "w-7 h-7 rounded text-xs font-medium border transition-colors",
                difficulty === d
                  ? "border-[#2d9cdb] bg-[#2d9cdb]/10 text-[#2d9cdb]"
                  : "border-border/60 text-muted-foreground hover:border-border"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Chain visualization */}
      <div className="relative">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-0 min-w-max">
            {blocks.map((block, idx) => (
              <div key={block.height} className="flex items-center">
                {idx > 0 && <ChainArrow />}
                <BlockCard
                  block={block}
                  selected={selectedBlockHeight === block.height}
                  onClick={() =>
                    setSelectedBlockHeight(
                      selectedBlockHeight === block.height ? null : block.height
                    )
                  }
                />
              </div>
            ))}
            {/* Mining placeholder */}
            {mining && (
              <div className="flex items-center">
                <ChainArrow />
                <div className="flex-shrink-0 w-44 rounded-lg border border-[#2d9cdb]/40 bg-[#2d9cdb]/5 p-3 flex flex-col gap-3">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[#2d9cdb]">
                    Mining...
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <MiningDots />
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center">
                    Finding nonce (diff {difficulty})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Click a block to inspect it</p>
      </div>

      {/* Block detail panel */}
      {selectedBlock && (
        <div className="border border-border/60 rounded-lg bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {selectedBlock.height === 0 ? "Genesis Block" : `Block #${selectedBlock.height}`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Mined {formatTime(selectedBlock.timestamp)}
                {selectedBlock.height > 0 && ` by ${selectedBlock.miner}`}
              </div>
            </div>
            <button
              onClick={() => setSelectedBlockHeight(null)}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs p-1"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Hash</div>
              <div className="font-mono text-xs text-foreground bg-muted/30 rounded px-2 py-1 break-all">
                {selectedBlock.hash}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Prev Hash</div>
              <div className="font-mono text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 break-all">
                {selectedBlock.prevHash}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Nonce</div>
              <div className="font-mono text-xs text-foreground">{selectedBlock.nonce.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Transactions</div>
              <div className="text-xs text-foreground">{selectedBlock.transactions.length}</div>
            </div>
          </div>

          {selectedBlock.transactions.length > 0 ? (
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                Confirmed Transactions
              </div>
              <div className="border border-border/40 rounded-lg px-3 bg-muted/10">
                {selectedBlock.transactions.map((tx, i) => (
                  <TxRow key={i} tx={tx} idx={i} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No transactions in this block.
            </p>
          )}
        </div>
      )}

      {/* Pending transaction pool */}
      <div className="border border-border/60 rounded-lg bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Mempool</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {pendingTxs.length} pending transaction{pendingTxs.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={addTransaction}
            disabled={pendingTxs.length >= 8}
            className={cn(
              "text-xs px-3 py-1.5 rounded border font-medium transition-colors",
              pendingTxs.length >= 8
                ? "border-border/30 text-muted-foreground/50 cursor-not-allowed"
                : "border-border/60 text-foreground hover:border-border"
            )}
          >
            + Add Transaction
          </button>
        </div>

        {pendingTxs.length > 0 ? (
          <div className="border border-border/40 rounded-lg px-3 bg-muted/10">
            {pendingTxs.map((tx, i) => (
              <TxRow key={i} tx={tx} idx={i} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Mempool is empty. Add transactions before mining.
          </p>
        )}
      </div>

      {/* Mine button */}
      <button
        onClick={mineBlock}
        disabled={mining || pendingTxs.length === 0}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-medium transition-colors",
          mining || pendingTxs.length === 0
            ? "bg-muted/30 text-muted-foreground cursor-not-allowed"
            : "bg-[#2d9cdb] text-white hover:bg-[#2d9cdb]/90 active:bg-[#2d9cdb]/80"
        )}
      >
        {mining ? (
          <span className="flex items-center justify-center gap-2">
            <MiningDots /> Mining block...
          </span>
        ) : pendingTxs.length === 0 ? (
          "Add transactions to mine"
        ) : (
          `Mine Block #${tipBlock.height + 1} (${pendingTxs.length} tx)`
        )}
      </button>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Note: Hashes here are simulated for illustration. Real Bitcoin uses SHA-256 and requires
        finding a hash below a numeric target. Higher difficulty means more leading zeros required.
      </p>
    </div>
  );
}
