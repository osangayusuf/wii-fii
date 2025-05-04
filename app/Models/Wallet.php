<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'balance',
    ];

    /**
     * Get the user that owns the wallet.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for the wallet.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Add funds to the wallet.
     *
     * @param float $amount
     * @return bool
     */
    public function addFunds(float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $this->balance += $amount;
        return $this->save();
    }

    /**
     * Deduct funds from the wallet.
     *
     * @param float $amount
     * @return bool
     */
    public function deductFunds(float $amount): bool
    {
        if ($amount <= 0 || $this->balance < $amount) {
            return false;
        }

        $this->balance -= $amount;
        return $this->save();
    }
}
