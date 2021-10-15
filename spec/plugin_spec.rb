# frozen_string_literal: true

require 'rails_helper'

describe ::DiscourseAlgolia do
  it 'loads net/http/persistent' do
    expect(Faraday::Adapter::NetHttpPersistent.loaded?).to eq(true)
    expect(Faraday::Adapter::NetHttpPersistent.load_error).to be_blank
  end
end
