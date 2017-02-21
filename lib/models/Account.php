<?php
namespace models;

use core;
use \Exception;

/**
 * @author Jason Wright <jason@silvermast.io>
 * @since 2/20/17
 * @package charon
 */
class Account extends core\Model {

    const TABLE = 'accounts';

    public $id;
    public $name;
    public $slug;
    public $status;
    public $dateCreated;
    public $dateUpdated;

    /**
     * @var array
     * @todo finish
     */
    protected static $_indexes = [
        ['id' => 1, '$unique' => true],
        ['slug' => 1, '$unique' => true],
    ];

    /**
     * @return $this
     * @throws Exception
     */
    public function validate() {
        if (mb_strlen($this->id) > 1024) throw new Exception('Invalid id');
        if (mb_strlen($this->name) > 1024) throw new Exception('Invalid name');
        if (mb_strlen($this->slug) > 50) throw new Exception('Invalid Slug. Must be 50 characters or less');

        return $this;
    }

    /**
     * Saves the object
     * @throws Exception
     * @return core\Model
     */
    public function save() {
        // slug is unique
        if (self::findOne(['slug' => $this->slug, 'id' => ['$not' => $this->id]]))
            throw new Exception('Unable to save Account. That slug belongs to another account.');

        $this->dateCreated = $this->dateCreated ?? time();
        $this->dateUpdated = time();
        $this->status      = isset($this->status) ? $this->status : 1;
        return parent::save();
    }

}